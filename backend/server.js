require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

const path = require('path');

const app = express();

// Connect to Cloud Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Essential for handling incoming JSON data payloads

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Middleware
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/kpis', require('./routes/kpiRoutes'));
app.use('/api/kpi', require('./routes/kpiRoutes'));

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('KPI System Backend API is running...');
});

// Start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in development on port ${PORT}`));