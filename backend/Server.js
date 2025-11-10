require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import and initialize database connection
require('./db/connection');

const app = express();

// --- MIDDLEWARE SETUP ---
app.use(morgan('dev'));     // Log all requests
app.use(express.json());    // Parse incoming JSON
app.use(cors());            // Enable CORS for all origins

// --- STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
// This allows accessing uploaded files like: http://localhost:4000/uploads/profile_pics/filename.jpg

// --- ROUTE IMPORTS ---
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes'); // ✅ AI recommendation route

// --- ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes); // ✅ Mount recommendation API

// --- DEFAULT TEST ROUTE ---
app.get('/', (req, res) => {
  res.send('Welcome to Online Hotel Booking & Management System API');
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- START SERVER ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
