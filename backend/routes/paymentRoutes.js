const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken } = require('../utils/authMiddleware');
const Booking = require('../modals/Booking');

const router = express.Router();

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Step 1: Create Razorpay Order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    const options = {
      amount: amount * 100, // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user || !room || !checkIn || !checkOut || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Save booking with correct schema fields
    const newBooking = new Booking({
      user,
      room,
      checkIn,             // ✅ matches schema
      checkOut,            // ✅ matches schema
      guests,
      totalPrice: totalAmount, // ✅ matches schema
      paymentDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

    const savedBooking = await newBooking.save();
    const populatedBooking = await savedBooking.populate('room user', 'name email type price');

    res.status(200).json({
      success: true,
      message: 'Payment verified & booking created successfully.',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});


module.exports = router;
