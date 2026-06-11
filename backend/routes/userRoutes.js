const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const User = require('../models/User');

router.get('/staff', protectRoute, requireRole('manager'), async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' })
      .select('_id firstName lastName email roleAtShop');
    res.status(200).json({ data: staff });
  } catch (error) {
    console.error(`Error in getStaffList: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
