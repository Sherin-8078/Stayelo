require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Initialize database connection
require('./db/connection');

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Import ChatMessage model
const ChatMessage = require('./modals/ChatMessage');

io.on('connection', (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // Send chat history to the new client
  ChatMessage.find().sort({ createdAt: 1 })
    .then(messages => socket.emit('chat_history', messages))
    .catch(err => console.error('Error fetching chat history:', err));

  // Listen for incoming chat messages
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new ChatMessage(data);
      await newMessage.save();
      io.emit('receive_message', newMessage); // Broadcast to all clients
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// --- MIDDLEWARE ---
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Enable CORS

// --- STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Example: http://localhost:4000/uploads/profile_pics/filename.jpg

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Razorpay

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/payment', paymentRoutes);

// --- DEFAULT ROUTE ---
app.get('/', (req, res) => {
  res.send('🏨 Welcome to Online Hotel Booking & Management System API');
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- START SERVER ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
