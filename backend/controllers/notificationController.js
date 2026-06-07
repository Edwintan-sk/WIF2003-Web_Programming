const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { getRelativeTime } = require('../utils/time');

/**
 * Shape a notification document for the frontend Notification Center.
 */
const formatNotification = (n) => ({
  id: n._id,
  tag: n.tag,
  category: n.category,
  title: n.title,
  description: n.description,
  link: n.link,
  isRead: n.isRead,
  time: getRelativeTime(n.createdAt),
  createdAt: n.createdAt,
});

/**
 * @desc    List notifications for the logged-in user (newest first, paginated).
 * @route   GET /api/notifications
 * @access  Protected
 */
exports.getNotifications = async (req, res) => {
  try {
    const email = req.user.email;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [items, total, unread] = await Promise.all([
      Notification.find({ recipientEmail: email })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipientEmail: email }),
      Notification.countDocuments({ recipientEmail: email, isRead: false }),
    ]);

    res.status(200).json({
      data: items.map(formatNotification),
      total,
      unread,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(`Error in getNotifications: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Unread count for the sidebar badge.
 * @route   GET /api/notifications/unread-count
 * @access  Protected
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const unread = await Notification.countDocuments({
      recipientEmail: req.user.email,
      isRead: false,
    });
    res.status(200).json({ unread });
  } catch (error) {
    console.error(`Error in getUnreadCount: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Mark a single notification read/unread (toggle supported via body).
 * @route   PATCH /api/notifications/:id/read
 * @access  Protected
 */
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const isRead =
      req.body.isRead !== undefined ? Boolean(req.body.isRead) : true;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientEmail: req.user.email },
      { isRead },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ notification: formatNotification(notification) });
  } catch (error) {
    console.error(`Error in markRead: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Mark all of the user's notifications as read.
 * @route   PATCH /api/notifications/read-all
 * @access  Protected
 */
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientEmail: req.user.email, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error(`Error in markAllRead: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
