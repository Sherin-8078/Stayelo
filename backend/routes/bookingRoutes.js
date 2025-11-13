
const express = require("express");
const crypto = require("crypto");
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
    console.log("📦 Fetching all bookings (Admin)");
    const bookings = await Booking.find()
      .populate("user", "email role")
      .populate("room", "name type price image capacity");
    console.log(`✅ Found ${bookings.length} total bookings.`);
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching all bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
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
    console.log(`📦 Fetching bookings for user: ${userId}`);

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    if (req.user.role !== "ADMIN" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate("room", "name type price image capacity")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings for this user.`);
    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for this user." });
    }

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    res.status(500).json({ message: "Error fetching user bookings", error: error.message });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (Customer)
 * @access  Private
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("📩 Incoming booking request:", req.body);

    const { roomId, checkIn, checkOut, guests, razorpayOrderId } = req.body;

    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: "Room ID, dates, and guests are required." });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      console.warn("⚠️ Room not found for ID:", roomId);
      return res.status(404).json({ message: "Room not found." });
    }

    if (guests > room.capacity) {
      console.warn(`⚠️ Guest limit exceeded: ${guests}/${room.capacity}`);
      return res.status(400).json({
        message: `This room allows a maximum of ${room.capacity} guests.`,
      });
    }

    const overlappingBookings = await Booking.find({
      room: roomId,
      status: "Confirmed",
      $or: [{ checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }],
    });

    if (overlappingBookings.length > 0) {
      console.warn("⚠️ Room unavailable for selected dates:", overlappingBookings.length);
      return res.status(400).json({ message: "Room is unavailable for the selected dates." });
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );
    const totalPrice = nights * room.price;

    const booking = new Booking({
      user: req.user.id,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: "Pending",
      paymentDetails: {
        orderId: razorpayOrderId || null,
        paymentStatus: "Pending",
      },
    });

    await booking.save();
    console.log("✅ Booking created and saved:", booking._id);

    res.status(201).json({
      success: true,
      message: "Booking created. Awaiting payment verification.",
      bookingId: booking._id,
      totalPrice,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
});

/**
 * ✅ VERIFY PAYMENT & SEND MAIL
 * @route   POST /api/bookings/verify-payment
 * @desc    Verify Razorpay signature and confirm booking
 * @access  Private
 */
router.post("/verify-payment", authenticateToken, async (req, res) => {
  try {
    console.log("💳 Payment verification request:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user,
      room,
      checkIn,
      checkOut,
      guests,
      totalAmount,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !user ||
      !room ||
      !checkIn ||
      !checkOut ||
      !totalAmount
    ) {
      console.warn("⚠️ Missing payment verification fields.");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("🧮 Signature comparison:", {
      generated_signature,
      provided_signature: razorpay_signature,
    });

    if (generated_signature !== razorpay_signature) {
      console.error("❌ Invalid payment signature!");
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    console.log("✅ Payment signature verified successfully.");

    const newBooking = new Booking({
      user,
      room,
      checkIn,
      checkOut,
      guests,
      totalPrice: totalAmount,
      status: "Confirmed",
      paymentDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        paymentStatus: "Paid",
      },
    });

    const savedBooking = await newBooking.save();
    console.log("💾 Booking saved:", savedBooking._id);

    const populatedBooking = await savedBooking.populate("room user", "name email type price");
    console.log("🧩 Populated booking details ready for email.");

    // ✅ Send confirmation email
    const userEmail = populatedBooking.user.email;
    const subject = `Booking Confirmed: ${populatedBooking.room.name}`;
    const message = `
      <h2>🎉 Booking Confirmed!</h2>
      <p>Dear ${populatedBooking.user.name || "Guest"},</p>
      <p>Your booking for <strong>${populatedBooking.room.name}</strong> (${populatedBooking.room.type}) is confirmed.</p>
      <ul>
        <li><strong>Check-in:</strong> ${new Date(checkIn).toDateString()}</li>
        <li><strong>Check-out:</strong> ${new Date(checkOut).toDateString()}</li>
        <li><strong>Guests:</strong> ${guests}</li>
        <li><strong>Total Paid:</strong> ₹${totalAmount}</li>
      </ul>
      <p>Thank you for booking with Stayelo 🏠</p>
    `;

    console.log("🚀 Preparing to send confirmation email to:", userEmail);
    try {
      await sendMail(userEmail, subject, message);
      console.log(`📧 Confirmation email sent to ${userEmail}`);
    } catch (mailErr) {
      console.error("❌ Error sending confirmation email:", mailErr);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified & booking created successfully. Confirmation email sent.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
});

/**
 * ✅ Booking Trends (Moved ABOVE /:id)
 * @route   GET /api/bookings/trends
 * @desc    Get monthly booking trends for charts
 * @access  Public
 */
router.get("/trends", async (req, res) => {
  try {
    console.log("📊 Fetching booking trends...");
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$checkIn" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = bookings.map((b) => ({
      label: b._id,
      bookings: b.count,
    }));

    console.log(`✅ ${formatted.length} trend points fetched.`);
    res.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching booking trends:", error);
    res.status(500).json({ message: "Error fetching booking trends", error: error.message });
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

    res.status(200).json({ message: "Booking status updated successfully.", booking });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res.status(500).json({ message: "Error updating booking", error: error.message });
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

    if (booking.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to cancel this booking." });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking already cancelled." });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled successfully.", booking });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
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
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    res.status(200).json({ message: "Booking deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({ message: "Error deleting booking", error: error.message });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID
 * @access  Private
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room", "name type price image capacity")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("❌ Error fetching booking:", err.message);
    res.status(500).json({ message: "Server error while fetching booking" });
  }
});

module.exports = router;
