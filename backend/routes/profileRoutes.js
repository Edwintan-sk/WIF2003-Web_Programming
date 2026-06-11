const express = require('express');
const multer = require('multer');
const { protectRoute } = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../config/profileUpload');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.use(protectRoute);

router.get('/', profileController.getProfile);
router.patch(
  '/',
  (req, res, next) => {
    uploadProfilePhoto.single('photo')(req, res, (error) => {
      if (!error) return next();

      if (
        error instanceof multer.MulterError &&
        error.code === 'LIMIT_FILE_SIZE'
      ) {
        return res.status(400).json({
          message: 'Profile photo must be 2 MB or smaller.',
        });
      }

      return res.status(400).json({
        message: 'Profile photo must be a JPEG, PNG, or WebP image.',
      });
    });
  },
  profileController.updateProfile
);
router.patch('/password', profileController.changePassword);
router.patch('/deactivate', profileController.deactivateAccount);

module.exports = router;
