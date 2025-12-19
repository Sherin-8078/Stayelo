require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("./db/connection");

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const ChatMessage = require("./modals/ChatMessage");

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  ChatMessage.find()
    .sort({ createdAt: 1 })
    .then((messages) => socket.emit("chat_history", messages))
    .catch(console.error);

  socket.on("send_message", async (data) => {
    try {
      const msg = new ChatMessage(data);
      await msg.save();
      io.emit("receive_message", msg);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () =>
    console.log(`❌ Client disconnected: ${socket.id}`)
  );
});

// --- MIDDLEWARE ---
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : true,
    credentials: true,
  })
);

// --- STATIC UPLOADS ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// --- ROOT ---
app.get("/", (req, res) => {
  res.send("🏨 Stayelo Backend API is running");
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err);
  res.status(500).json({ message: err.message });
});

// --- START ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
