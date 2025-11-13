const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: { type: String, enum: ['ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    profilePic: { type: String, default: "" },

    pastBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],

    resetOtp: String, // OTP-based password reset
    resetOtpExpiry: Date,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);