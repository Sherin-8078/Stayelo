// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Checked-in", "Checked-out", "Cancelled"],
      default: "Pending",
    },
    paymentDetails: {
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
      paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
      },
    },
  },
  { timestamps: true }
);

// ✅ Automatically mark booking as confirmed when payment is successful
bookingSchema.pre("save", function (next) {
  if (this.paymentDetails?.paymentStatus === "Paid" && this.status === "Pending") {
    this.status = "Confirmed";
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
