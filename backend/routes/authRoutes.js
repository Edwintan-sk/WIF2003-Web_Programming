const express = require('express');
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const { protectRoute } = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../config/profileUpload');

const router = express.Router();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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

router.get('/staff', protectRoute, async (req, res) => {
  try {
    const staffMembers = await User.find({ role: 'staff', isActive: true });
    return res.status(200).json(
      staffMembers.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleAtShop: user.roleAtShop,
        positionTitle: user.positionTitle,
        photoUrl: user.photoUrl,
      }))
    );
  } catch (error) {
    console.error(`Get staff members error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to retrieve staff members.',
    });
  }
});

module.exports = router;
