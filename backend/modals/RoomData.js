const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    amenities: [{ type: String }],
    rating: { type: Number, default: 0 },
    images: [{ type: String }],
    capacity: { type: Number, default: 2 }, // ✅ added for guest filtering
    bookings: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
