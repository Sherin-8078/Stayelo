// utils/gemini.js
const axios = require("axios");

/**
 * Generates a text completion using Google Gemini API
 * @param {string} prompt - The text prompt to send to Gemini
 * @returns {Promise<string>} - Generated text from Gemini
 */
async function generateGeminiText(prompt) {
  try {
    // ✅ Ensure API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    console.log("🚀 Sending request to Gemini API...");

    // ✅ Make request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    // ✅ Extract response text
    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!text) {
      console.warn("⚠️ Gemini returned empty or malformed response");
      return "We’ve tailored these room recommendations just for you — based on your recent preferences!";
    }

    console.log("✅ Gemini Response received successfully.");
    return text.trim();
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);

    // If the API fails or times out, return a fallback explanation
    return "Based on your previous bookings, we’ve selected rooms that perfectly suit your style and comfort preferences.";
  }
}

module.exports = { generateGeminiText };
