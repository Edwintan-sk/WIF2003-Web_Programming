const mongoose = require('mongoose');

/**
 * In-app notification addressed to a single recipient (by email).
 * Powers the Notification Center page and the sidebar unread badge.
 */
const NotificationSchema = new mongoose.Schema(
  {
    recipientEmail: { type: String, required: true, index: true },
    tag: {
      type: String,
      enum: ['Decision', 'KPI', 'Deadline', 'Comment', 'Activity'],
      default: 'Activity',
    },
    category: {
      type: String,
      enum: ['action', 'activity', 'deadline'],
      default: 'activity',
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    kpiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kpi' },
  },
  { timestamps: true }
);

// Supports the "unread first, newest first" listing query.
NotificationSchema.index({ recipientEmail: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
