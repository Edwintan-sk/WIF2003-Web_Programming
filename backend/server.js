require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

const app = express();

// Connect to Cloud Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Essential for handling incoming JSON data payloads

// Route Middleware
app.use('/api/kpis', require('./routes/kpiRoutes'));

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('KPI System Backend API is running...');
});

// Start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in development on port ${PORT}`));