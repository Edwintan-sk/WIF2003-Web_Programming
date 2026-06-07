const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const managerController = require('../controllers/managerController');

// Team-wide dashboard — managers only.
router.get(
  '/dashboard',
  protectRoute,
  requireRole('manager'),
  managerController.getManagerDashboard
);

module.exports = router;
