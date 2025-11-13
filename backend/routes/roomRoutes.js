const express = require("express");
const Room = require("../modals/RoomData");
const Booking = require("../modals/Booking");
const { authenticateToken, requireRole } = require("../utils/authMiddleware");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const PDFDocument = require("pdfkit");

const router = express.Router();

// ========================== MULTER CONFIG ==========================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper for Cloudinary upload
const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "stayelo/rooms",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// ========================== ADD ROOM ==========================
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { type, price, available, location, description, amenities, rating } =
        req.body;

      if (!type || !price)
        return res.status(400).json({ error: "Type and price are required" });

      let imageUrls = [];
      if (req.files?.length) {
        const uploads = await Promise.all(
          req.files.map((file) => uploadImage(file.buffer))
        );
        imageUrls = uploads.map((r) => r.secure_url);
      }

      const room = new Room({
        type,
        price: Number(price),
        available: available === "true" || available === true,
        location: location || "Unknown",
        description: description || "No description available.",
        amenities: amenities
          ? Array.isArray(amenities)
            ? amenities
            : amenities.split(",").map((a) => a.trim())
          : [],
        rating: rating ? Number(rating) : 4.0,
        images:
          imageUrls.length > 0
            ? imageUrls
            : [
                "https://res.cloudinary.com/demo/image/upload/v1730512762/stayelo/rooms/default_room.jpg",
              ],
      });

      await room.save();
      res.status(201).json({ message: "Room added successfully", room });
    } catch (err) {
      console.error("❌ Error adding room:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ========================== FILTER ROOMS (PUBLIC) ==========================
router.get("/search", async (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests, roomType, priceMin, priceMax } = req.query;
    const query = {};

    // Location filter
    if (destination) {
      query.location = { $regex: destination, $options: "i" };
    }

    // Room type filter
    if (roomType) {
      query.type = roomType;
    }

    // Guests/capacity filter
    const guestsNum = parseInt(guests, 10);
    if (!isNaN(guestsNum)) {
      query.capacity = { $gte: guestsNum };
    }

    // Price filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Availability
    query.available = true;

    console.log("Constructed search query:", JSON.stringify(query));

    const rooms = await Room.find(query).select(
      "type price available location description amenities rating images capacity"
    );

    console.log("Found rooms:", rooms.length);

    if (!rooms.length) {
      return res.status(404).json({ message: "No rooms found for given filters" });
    }

    res.json(rooms);
  } catch (err) {
    console.error("❌ Error filtering rooms:", err);
    res.status(500).json({
      message: "Server error during room search",
      error: err.message,
    });
  }
});


// ========================== UPDATE ROOM ==========================
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { type, price, available, location, description, amenities, rating } =
        req.body;

      const room = await Room.findById(id);
      if (!room) return res.status(404).json({ error: "Room not found" });

      // Handle new image uploads if provided
      let imageUrls = room.images;
      if (req.files?.length) {
        const uploads = await Promise.all(
          req.files.map((file) => uploadImage(file.buffer))
        );
        // Append new images to existing ones
        imageUrls = [...room.images, ...uploads.map((r) => r.secure_url)];
      }

      Object.assign(room, {
        type: type || room.type,
        price: price ? Number(price) : room.price,
        available:
          available === "true" || available === true || room.available,
        location: location || room.location,
        description: description || room.description,
        amenities: amenities
          ? Array.isArray(amenities)
            ? amenities
            : amenities.split(",").map((a) => a.trim())
          : room.amenities,
        rating: rating ? Number(rating) : room.rating,
        images: imageUrls,
      });

      await room.save();
      res.json({ message: "Room updated successfully", room });
    } catch (err) {
      console.error("❌ Error updating room:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ========================== DELETE ROOM ==========================
router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const room = await Room.findById(id);
      if (!room) return res.status(404).json({ error: "Room not found" });

      const activeBookings = await Booking.find({
        room: id,
        status: { $in: ["CONFIRMED", "CHECKED_IN"] },
      });

      if (activeBookings.length > 0)
        return res.status(400).json({
          error:
            "Cannot delete room with active bookings. Mark as unavailable instead.",
        });

      await room.deleteOne();
      res.json({ message: "Room deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting room:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ========================== ADMIN FETCH ALL ROOMS ==========================
router.get("/", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ error: err.message });
  }
});





router.get("/public", async (req, res) => {
  try {
    const { type, priceMin, priceMax } = req.query;
    const filter = { available: true };

    if (type) filter.type = type;
    if (priceMin || priceMax) filter.price = {};
    if (priceMin) filter.price.$gte = Number(priceMin);
    if (priceMax) filter.price.$lte = Number(priceMax);

    // Include capacity field here
    const rooms = await Room.find(filter).select(
      "type price available location description amenities rating images capacity"
    );

    const formattedRooms = rooms.map((r) => ({
      ...r._doc,
      images:
        r.images && r.images.length
          ? r.images
          : [
              "https://res.cloudinary.com/demo/image/upload/v1730512762/stayelo/rooms/default_room.jpg",
            ],
    }));

    res.json(formattedRooms);
  } catch (err) {
    console.error("❌ Error fetching public rooms:", err);
    res.status(500).json({ error: err.message });
  }
});


// ========================== GET ROOM BY ID (PUBLIC) ==========================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).select(
      "type price available location description amenities rating images"
    );

    if (!room) return res.status(404).json({ error: "Room not found" });

    const roomData = {
      ...room._doc,
      images:
        room.images && room.images.length
          ? room.images
          : [
              "https://res.cloudinary.com/demo/image/upload/v1730512762/stayelo/rooms/default_room.jpg",
            ],
    };

    res.json(roomData);
  } catch (err) {
    console.error("❌ Error fetching room details:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================== ADMIN DASHBOARD ==========================
router.get(
  "/dashboard",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const bookings = await Booking.find({
        status: { $in: ["CONFIRMED", "CHECKED_IN"] },
      }).populate("room");

      const totalRevenue = bookings.reduce(
        (acc, b) => (b.room?.price ? acc + Number(b.room.price) : acc),
        0
      );

      res.json({
        totalBookings: bookings.length,
        totalRevenue,
        bookings,
      });
    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ========================== MONTHLY PDF REPORT ==========================
router.get(
  "/reports/monthly",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { year, month } = req.query;
      const now = new Date();
      const yearNum = parseInt(year) || now.getFullYear();
      const monthNum = parseInt(month) || now.getMonth() + 1;
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

      const bookings = await Booking.find({
        status: { $in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { $gte: startDate, $lte: endDate },
      }).populate("room");

      const totalRevenue = bookings.reduce(
        (acc, b) => (b.room ? acc + Number(b.room.price) : acc),
        0
      );

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=monthly_report_${yearNum}_${monthNum}.pdf`
      );

      doc.pipe(res);
      doc
        .fontSize(16)
        .text(`Monthly Report for ${monthNum}/${yearNum}`, {
          align: "center",
          underline: true,
        })
        .moveDown()
        .fontSize(12)
        .text(`Total Bookings: ${bookings.length}`)
        .text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`)
        .moveDown();

      bookings.forEach((b, i) => {
        doc.text(
          `${i + 1}. Room: ${b.room?.type || "N/A"} | ₹${b.room?.price || "N/A"} | Check-in: ${new Date(
            b.checkIn
          ).toLocaleDateString()}`
        );
      });

      doc.end();
    } catch (err) {
      console.error("❌ Error generating report:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ========================== TOTAL ROOMS COUNT (ADMIN) ==========================
router.get("/count", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    res.json({ totalRooms });
  } catch (err) {
    console.error("❌ Error fetching total rooms:", err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
