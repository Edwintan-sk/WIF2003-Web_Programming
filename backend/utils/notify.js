const Notification = require('../models/Notification');
const { sendEmail } = require('./email');

/**
 * Create a single in-app notification and (optionally) fire an email alert.
 * Never throws — notification failures must not break the triggering request.
 *
 * @param {object} options
 * @param {string} options.recipientEmail
 * @param {string} [options.tag]          - Decision | KPI | Deadline | Comment | Activity
 * @param {string} [options.category]     - action | activity | deadline
 * @param {string} options.title
 * @param {string} [options.description]
 * @param {string} [options.link]
 * @param {ObjectId} [options.kpiId]
 * @param {boolean} [options.sendMail=true]
 * @returns {Promise<object|null>}
 */
const createNotification = async ({
  recipientEmail,
  tag = 'Activity',
  category = 'activity',
  title,
  description = '',
  link = '',
  kpiId,
  sendMail = true,
}) => {
  if (!recipientEmail || !title) return null;

  try {
    const notification = await Notification.create({
      recipientEmail,
      tag,
      category,
      title,
      description,
      link,
      kpiId,
    });

    if (sendMail) {
      // Fire-and-forget; sendEmail never throws.
      sendEmail({
        to: recipientEmail,
        subject: `[KP EYE] ${title}`,
        text: description || title,
      });
    }

    return notification;
  } catch (err) {
    console.error(`[notify] Failed to create notification: ${err.message}`);
    return null;
  }
};

/**
 * Create the same notification for many recipients (de-duplicated).
 * @param {string[]} recipients
 * @param {object} payload - same shape as createNotification (without recipientEmail)
 */
const createNotifications = async (recipients, payload) => {
  const unique = [...new Set((recipients || []).filter(Boolean))];
  return Promise.all(
    unique.map((recipientEmail) => createNotification({ recipientEmail, ...payload }))
  );
};

module.exports = { createNotification, createNotifications };
