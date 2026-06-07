const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Kpi = require('../models/Kpi');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { createNotifications } = require('../utils/notify');
const { getRelativeTime } = require('../utils/time');

/** Strip HTML tags to prevent stored XSS. */
const sanitizeInput = (str) =>
  typeof str === 'string' ? str.replace(/<[^>]*>/g, '').trim() : '';

const ROLE_AVATAR = {
  staff: { bg: '#F9E7DE', color: '#C85A3A' },
  manager: { bg: '#E4EDE7', color: '#0D3B2E' },
};

const initialsOf = (name) =>
  (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

/** Shape a comment for the Feedback conversation thread. */
const formatComment = (c) => {
  const avatar = ROLE_AVATAR[c.authorRole] || ROLE_AVATAR.staff;
  return {
    id: c._id,
    authorEmail: c.authorEmail,
    userName: c.authorName,
    role: c.authorRole === 'manager' ? 'Manager' : 'Staff',
    avatarInitials: initialsOf(c.authorName),
    avatarBg: avatar.bg,
    avatarColor: avatar.color,
    message: c.body,
    time: formatTime(c.createdAt),
    relativeTime: getRelativeTime(c.createdAt),
    createdAt: c.createdAt,
  };
};

/**
 * @desc    List all comments for a KPI thread (oldest first).
 * @route   GET /api/comments/:kpiId
 * @access  Protected
 */
exports.getComments = async (req, res) => {
  try {
    const { kpiId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(kpiId)) {
      return res.status(400).json({ message: 'Invalid KPI id' });
    }

    const comments = await Comment.find({ kpiId }).sort({ createdAt: 1 });
    res.status(200).json({ data: comments.map(formatComment) });
  } catch (error) {
    console.error(`Error in getComments: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Post a comment to a KPI thread. Triggers notifications to the
 *          other party (assignee and/or managers).
 * @route   POST /api/comments/:kpiId
 * @access  Protected
 */
exports.createComment = async (req, res) => {
  try {
    const { kpiId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(kpiId)) {
      return res.status(400).json({ message: 'Invalid KPI id' });
    }

    const body = sanitizeInput(req.body.body);
    if (!body) {
      return res.status(400).json({ message: 'Comment body is required' });
    }
    if (body.length > 2000) {
      return res.status(400).json({ message: 'Comment must not exceed 2000 characters' });
    }

    const kpi = await Kpi.findById(kpiId);
    if (!kpi) {
      return res.status(404).json({ message: 'KPI not found' });
    }

    const author = await User.findById(req.user.userId);
    const authorName = author
      ? author.englishName || `${author.firstName} ${author.lastName}`.trim()
      : req.user.email;
    const authorRole = req.user.role;

    const comment = await Comment.create({
      kpiId,
      authorEmail: req.user.email,
      authorName,
      authorRole,
      body,
    });

    // Audit log (fault-tolerant).
    try {
      await Activity.create({
        assignee: kpi.assignee,
        title: 'New comment',
        desc: `${authorName} commented on '${kpi.title}'`,
        type: 'comment',
        dotColor: '#597495',
        kpiId: kpi._id,
      });
    } catch (actError) {
      console.error(`Failed to log comment activity: ${actError.message}`);
    }

    // Notify the other side (fault-tolerant).
    try {
      const recipients = [];
      if (kpi.assignee && kpi.assignee !== req.user.email) {
        recipients.push(kpi.assignee);
      }
      if (authorRole === 'staff') {
        const managers = await User.find({ role: 'manager' }).select('email');
        managers.forEach((m) => recipients.push(m.email));
      }

      const link = authorRole === 'manager' ? '/staff/feedback' : '/manager/feedback';
      await createNotifications(recipients, {
        tag: 'Comment',
        category: 'action',
        title: 'New comment',
        description: `${authorName} commented on '${kpi.title}'`,
        link,
        kpiId: kpi._id,
      });
    } catch (notifyError) {
      console.error(`Failed to send comment notification: ${notifyError.message}`);
    }

    res.status(201).json({ comment: formatComment(comment) });
  } catch (error) {
    console.error(`Error in createComment: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
