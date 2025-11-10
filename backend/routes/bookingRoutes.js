const express = require("express");
const Booking = require("../modals/Booking");
const User = require("../modals/UserData");
const Room = require("../modals/RoomData");
const { authenticateToken, requireRole } = require("../utils/authMiddleware");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (Admin only)
 * @access  Private (Admin)
 */
router.get("/", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "email role")
      .populate("room", "name type price image");
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching all bookings:", error);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
});

/**
 * @route   GET /api/bookings/user/:userId
 * @desc    Get all bookings for a specific user
 * @access  Private (Customer)
 */
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Ensure the user can only fetch their own bookings (unless admin)
    if (req.user.role !== "ADMIN" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate("room", "name type price image")
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user." });
    }

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    res
      .status(500)
      .json({ message: "Error fetching user bookings", error: error.message });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (Customer)
 * @access  Private
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    if (!roomId || !checkIn || !checkOut || !guests) {
      return res
        .status(400)
        .json({ message: "Room ID, dates, and guests are required." });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Prevent overlapping bookings
    const overlappingBookings = await Booking.find({
      room: roomId,
      status: "Confirmed",
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res
        .status(400)
        .json({ message: "Room is unavailable for the selected dates." });
    }

    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24);
    const totalPrice = nights * room.price;

    // ✅ Create Booking
    const booking = new Booking({
      user: req.user.id,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: "Confirmed",
    });

    await booking.save();

    // ✅ Add booking to user's pastBookings
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { pastBookings: booking._id } },
      { new: true }
    );

    const user = await User.findById(req.user.id);
    const formattedCheckIn = checkInDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedCheckOut = checkOutDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // ✅ Send Confirmation Email
    const emailSubject = `Your Stayelo Booking is Confirmed! 🎉`;
    const emailBody = `
Hello ${user.email},

Thank you for booking with Stayelo!

📅 Booking Details:
- Room: ${room.name} (${room.type})
- Guests: ${guests}
- Check-in: ${formattedCheckIn}
- Check-out: ${formattedCheckOut}
- Total: ₹${totalPrice}

We look forward to hosting you soon!
🏨 Stayelo Team
`;

    await sendMail(user.email, emailSubject, emailBody);

    const populatedBooking = await booking.populate("room user", "name email type price");

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
});

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking status (Admin only)
 * @access  Private (Admin)
 */
router.put("/:id", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required." });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("room user", "name email type price");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    res
      .status(200)
      .json({ message: "Booking status updated successfully.", booking });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
});

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel a booking (Customer)
 * @access  Private
 */
router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // Check authorization
    if (booking.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this booking." });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking already cancelled." });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled successfully.", booking });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: error.message });
  }
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete booking (Admin only)
 * @access  Private (Admin)
 */
router.delete("/:id", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    res.status(200).json({ message: "Booking deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
});

/**
 * @route   GET /api/bookings/trends
 * @desc    Get booking trends for chart
 * @access  Public
 */
router.get("/trends", async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkIn" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(bookings.map((b) => ({ label: b._id, bookings: b.count })));
  } catch (error) {
    console.error("❌ Error fetching booking trends:", error);
    res
      .status(500)
      .json({ message: "Error fetching booking trends", error: error.message });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID (with populated room & user)
 * @access  Private
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room user");
    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("❌ Error fetching booking:", err.message);
    res.status(500).json({ message: "Server error while fetching booking" });
  }
});

module.exports = router;
