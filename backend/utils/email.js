/**
 * Optional email sender for notification alerts.
 *
 * Email is OFF by default and completely optional. Real emails are only sent
 * when SMTP_HOST / SMTP_USER / SMTP_PASS are configured in the environment.
 * When SMTP is not configured (or nodemailer is not installed) the alert is
 * simply logged to the console, so the rest of the system keeps working.
 */

let transporter = null;
let transporterReady = false;

const isConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (transporterReady) return transporter;
  transporterReady = true;

  if (!isConfigured()) {
    transporter = null;
    return transporter;
  }

  let nodemailer;
  try {
    // Lazy require so the app still boots if nodemailer is not installed.
    nodemailer = require('nodemailer');
  } catch (err) {
    console.warn('[email] nodemailer is not installed — email alerts will be logged only.');
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Send an email if SMTP is configured; otherwise log it. Never throws.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 * @returns {Promise<boolean>} Whether the message was delivered.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return false;

  const t = getTransporter();
  if (!t) {
    console.log(`[email:skipped] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`[email:sent] To: ${to} | Subject: ${subject}`);
    return true;
  } catch (err) {
    console.error(`[email:error] ${err.message}`);
    return false;
  }
};

module.exports = { sendEmail, isConfigured };
