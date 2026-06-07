const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const profileUploadDirectory = path.join(__dirname, '..', 'uploads', 'profiles');

fs.mkdirSync(profileUploadDirectory, { recursive: true });

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, profileUploadDirectory);
  },
  filename: (req, file, callback) => {
    const extension = allowedMimeTypes.get(file.mimetype);
    const filename = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${extension}`;
    callback(null, filename);
  },
});

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'photo'));
  }

  return callback(null, true);
};

const uploadProfilePhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});

module.exports = {
  uploadProfilePhoto,
};
