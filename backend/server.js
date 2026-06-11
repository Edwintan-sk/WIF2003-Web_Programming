require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.js');

const app = express();

// Connect to Cloud Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json()); // Essential for handling incoming JSON data payloads
app.use(cookieParser());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Middleware
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/kpi', require('./routes/kpiRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('KPI System Backend API is running...');
});

// Start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in development on port ${PORT}`));
