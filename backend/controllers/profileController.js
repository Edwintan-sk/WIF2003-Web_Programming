const User = require('../models/User');
const {
  getProfilePhotoUrl,
  removeStoredProfilePhoto,
  removeUploadedProfilePhoto,
} = require('../config/profileUpload');

const EDITABLE_PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'englishName',
  'pronouns',
  'roleAtShop',
  'positionTitle',
  'countryCode',
  'phone',
];

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
  updatedAt: user.updatedAt,
});

const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error(`Get profile error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to retrieve profile.',
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      await removeUploadedProfilePhoto(req.file);
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    EDITABLE_PROFILE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const oldPhotoUrl = user.photoUrl;

    if (req.file) {
      user.photoUrl = getProfilePhotoUrl(req.file);
    }

    await user.save();

    if (req.file) {
      await removeStoredProfilePhoto(oldPhotoUrl);
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: buildSafeUser(user),
    });
  } catch (error) {
    await removeUploadedProfilePhoto(req.file);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(`Update profile error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to update profile.',
    });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: 'Current password, new password, and confirmation are required.',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: 'New passwords do not match.',
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: 'New password must be at least 8 characters.',
    });
  }

  try {
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      });
    }

    if (await user.comparePassword(newPassword)) {
      return res.status(400).json({
        message: 'New password must be different from the current password.',
      });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date(Date.now() - 1000);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    clearAuthCookie(res);

    return res.status(200).json({
      message: 'Password changed successfully. Please sign in again.',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(`Change password error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to change password.',
    });
  }
};

exports.deactivateAccount = async (req, res) => {
  const { password, confirmation } = req.body;

  if (!password || confirmation !== 'DEACTIVATE') {
    return res.status(400).json({
      message: 'Enter your password and type DEACTIVATE to continue.',
    });
  }

  try {
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Password is incorrect.',
      });
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    clearAuthCookie(res);

    return res.status(200).json({
      message: 'Your account has been deactivated.',
    });
  } catch (error) {
    console.error(`Deactivate account error: ${error.message}`);
    return res.status(500).json({
      message: 'Unable to deactivate account.',
    });
  }
};
