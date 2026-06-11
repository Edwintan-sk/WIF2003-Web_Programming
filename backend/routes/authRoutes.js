const express = require('express');
const crypto = require('crypto');
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { rateLimit } = require('express-rate-limit');
const User = require('../models/User');
const { protectRoute } = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../config/profileUpload');
const { sendEmail, isConfigured: isEmailConfigured } = require('../utils/email');

const router = express.Router();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY_MS = 15 * 60 * 1000;
const PASSWORD_RESET_RESPONSE =
  'If an active account exists for this email, a reset link has been sent.';

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many password reset requests. Please try again in 15 minutes.',
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many password reset attempts. Please try again in 15 minutes.',
  },
});

const buildSafeUser = (user) => ({
  id: user._id,
  role: user.role,
  photoUrl: user.photoUrl,
  firstName: user.firstName,
  lastName: user.lastName,
  englishName: user.englishName,
  pronouns: user.pronouns,
  roleAtShop: user.roleAtShop,
  positionTitle: user.positionTitle,
  countryCode: user.countryCode,
  phone: user.phone,
  employeeId: user.employeeId,
  email: user.email,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const removeUploadedFile = async (file) => {
  if (!file?.path) return;

  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Unable to remove uploaded profile photo: ${error.message}`);
    }
  }
};

router.post('/register', uploadProfilePhoto.single('photo'), async (req, res) => {
  try {
    const {
      role,
      firstName,
      lastName,
      englishName,
      pronouns,
      roleAtShop,
      positionTitle,
      countryCode,
      phone,
      employeeId,
      email,
      password,
    } = req.body;

    if (!role || !firstName || !lastName || !roleAtShop || !email || !password) {
      await removeUploadedFile(req.file);
      return res.status(400).json({
        message: 'Role, first name, last name, role at shop, email, and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      await removeUploadedFile(req.file);
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const user = new User({
      role,
      photoUrl: req.file ? `/uploads/profiles/${req.file.filename}` : '',
      firstName,
      lastName,
      englishName,
      pronouns,
      roleAtShop,
      positionTitle,
      countryCode,
      phone,
      employeeId: employeeId?.trim() || undefined,
      email: normalizedEmail,
      password,
    });

    await user.save();

    return res.status(201).json({
      message: 'Account created successfully.',
      user: buildSafeUser(user),
    });
  } catch (error) {
    await removeUploadedFile(req.file);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';

      return res.status(409).json({
        message: `An account with this ${duplicateField} already exists.`,
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: 'Unable to create account.',
    });
  }
});

router.use((error, req, res, next) => {
  if (!(error instanceof multer.MulterError)) {
    return next(error);
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Profile photo must be 2 MB or smaller.',
    });
  }

  return res.status(400).json({
    message: 'Profile photo must be a JPEG, PNG, or WebP image.',
  });
});

router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({
      message: 'Email is required.',
    });
  }

  if (!isEmailConfigured()) {
    console.error('Password reset requested while SMTP is not configured.');
    return res.status(503).json({
      message: 'Password reset email is temporarily unavailable.',
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(200).json({
        message: PASSWORD_RESET_RESPONSE,
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
    await user.save();

    const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .replace(/\/+$/, '');
    const resetUrl = `${clientOrigin}/reset-password/${resetToken}`;
    const emailSent = await sendEmail({
      to: user.email,
      subject: '[KP EYE] Reset your password',
      text: [
        'A password reset was requested for your KP EYE account.',
        `Reset your password using this link: ${resetUrl}`,
        'This link expires in 15 minutes and can only be used once.',
        'If you did not request this reset, you can ignore this email.',
      ].join('\n\n'),
      html: `
        <p>A password reset was requested for your KP EYE account.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 15 minutes and can only be used once.</p>
        <p>If you did not request this reset, you can ignore this email.</p>
      `,
    });

    if (!emailSent) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      console.error(`Unable to deliver password reset email to ${user.email}.`);
    }

    return res.status(200).json({
      message: PASSWORD_RESET_RESPONSE,
    });
  } catch (error) {
    console.error(`Forgot password error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to process the password reset request.',
    });
  }
});

router.post('/reset-password/:token', resetPasswordLimiter, async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({
      message: 'Password and password confirmation are required.',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: 'Passwords do not match.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters.',
    });
  }

  try {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        message: 'This password reset link is invalid or has expired.',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date(Date.now() - 1000);
    await user.save();

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error(`Reset password error: ${error.message}`);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: 'Unable to reset the password.',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role, remember = false } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: 'Email, password, and role are required.',
      });
    }

    if (!['manager', 'staff'].includes(role)) {
      return res.status(400).json({
        message: 'Role must be either manager or staff.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured.');
      return res.status(500).json({
        message: 'Login is not configured on the server.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'This account has been disabled.',
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}.`,
      });
    }

    const tokenDuration = remember
      ? '30d'
      : process.env.JWT_EXPIRES_IN || '1d';
    const cookieMaxAge = remember ? 30 * ONE_DAY_MS : ONE_DAY_MS;

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: tokenDuration,
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
    });

    return res.status(200).json({
      message: 'Login successful.',
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to log in.',
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({
    message: 'Logout successful.',
  });
});

router.get('/me', protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'This account has been disabled.',
      });
    }

    return res.status(200).json({
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error(`Get current user error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to retrieve the current user.',
    });
  }
});

module.exports = router;
