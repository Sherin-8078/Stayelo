const express = require("express");
const User = require("../modals/UserData");
const Room = require("../modals/RoomData");
const { authenticateToken } = require("../utils/authMiddleware");
const { generateGeminiText } = require("../utils/gemini"); // 🧠 import helper

const router = express.Router();

/**
 * @route GET /api/recommendations
 * @desc Recommend rooms based on user’s past booking history + Gemini summary
 * @access Private (requires JWT)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("📡 Generating recommendations for user:", req.user.id);

    // 🧩 Step 1: Fetch user with populated past bookings + room info
    const user = await User.findById(req.user.id).populate({
      path: "pastBookings",
      populate: { path: "room", model: "Room" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🧩 Step 2: If no past bookings, skip recommendations
    if (!user.pastBookings || user.pastBookings.length === 0) {
      return res.json({
        message:
          "No past bookings found — book a few rooms to get recommendations!",
        preferredType: null,
        recommendations: [],
        explanation: null,
      });
    }

    // 🧩 Step 3: Count how often each room type was booked
    const typeCount = {};
    user.pastBookings.forEach((booking) => {
      const roomType = booking.room?.type;
      if (roomType) {
        typeCount[roomType] = (typeCount[roomType] || 0) + 1;
      }
    });

    // 🧩 Step 4: Identify the user's most booked room type
    const preferredType = Object.entries(typeCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    if (!preferredType) {
      return res.json({
        message: "No clear room type preference found yet.",
        preferredType: null,
        recommendations: [],
        explanation: null,
      });
    }

    // 🧩 Step 5: Fetch rooms of that preferred type
    const recommendations = await Room.find({
      type: preferredType,
      available: true,
    })
      .select("type price location rating images amenities description")
      .limit(6)
      .lean();

    // 🧩 Step 6: Attach image URL (Cloudinary)
    const formattedRooms = recommendations.map((room) => {
      const imageUrl =
        Array.isArray(room.images) && room.images.length > 0
          ? room.images[0]
          : "https://via.placeholder.com/400x300?text=No+Image";

      return {
        ...room,
        image: imageUrl,
      };
    });

    // 🧩 Step 7: Sort by rating, then price
    formattedRooms.sort(
      (a, b) =>
        (b.rating || 0) - (a.rating || 0) || (a.price || 0) - (b.price || 0)
    );

    // 🧠 Step 8: Generate Gemini explanation (personalized)
    let explanation = "";
    try {
      const lastBooking = user.pastBookings[user.pastBookings.length - 1];
      const lastLocation = lastBooking?.room?.location || "various destinations";

      const explanationPrompt = `
You are a warm and friendly hotel booking assistant.
The user’s name is "${user.name}".
They have shown a preference for "${preferredType}" type rooms.
Their most recent stay was in "${lastLocation}".
There are ${formattedRooms.length} recommended rooms available now.
Write a short, personalized message (under 80 words)
highlighting why these ${preferredType} rooms are perfect for ${user.name.split(" ")[0]}.
Focus on comfort, amenities, and emotional appeal — avoid prices and links.
      `;

      console.log("🧠 Sending personalized prompt to Gemini API...");
      explanation = await generateGeminiText(explanationPrompt);

      if (!explanation || explanation.trim().length < 10) {
        console.warn("⚠️ Gemini returned empty/short response. Using fallback.");
        explanation = `Based on ${user.name}'s previous stays, we've picked the best ${preferredType} rooms — ideal for comfort and style preferences.`;
      } else {
        explanation = explanation.replace(/\n+/g, " ").trim();
        console.log("✅ Personalized Gemini explanation:", explanation);
      }
    } catch (err) {
      console.error("❌ Gemini API failed:", err.message);
      explanation = `Based on ${user.name}'s previous stays, we've picked the best ${preferredType} rooms — ideal for comfort and preferences.`;
    }

    // 🧩 Step 9: Send response
    return res.json({
      message: `Recommended ${preferredType} rooms based on ${user.name}'s booking history`,
      preferredType,
      recommendations: formattedRooms,
      explanation,
    });
  } catch (err) {
    console.error("💥 Recommendation Error:", err);
    res.status(500).json({
      error: "Server error while generating room recommendations",
    });
  }
});

module.exports = router;
