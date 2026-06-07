const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All notification routes require an authenticated user.
router.use(protectRoute);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
