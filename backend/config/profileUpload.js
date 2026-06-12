const crypto = require('crypto');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const multer = require('multer');

const profileUploadDirectory = path.join(__dirname, '..', 'uploads', 'profiles');
const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const hasEnvValue = (value) => Boolean(value && !/^<.*>$/.test(value.trim()));
const cloudinaryConfigured =
  hasEnvValue(process.env.CLOUDINARY_CLOUD_NAME) &&
  hasEnvValue(process.env.CLOUDINARY_API_KEY) &&
  hasEnvValue(process.env.CLOUDINARY_API_SECRET);

let cloudinary = null;
let storage;

if (cloudinaryConfigured) {
  cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'kpeye_profile_photos',
      resource_type: 'image',
      public_id: (req, file) => {
        const originalName = path
          .parse(file.originalname)
          .name
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${originalName}`;
      },
    },
  });

  console.log('Using Cloudinary for profile photo storage.');
} else {
  fs.mkdirSync(profileUploadDirectory, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, profileUploadDirectory);
    },
    filename: (req, file, callback) => {
      const extension = allowedMimeTypes.get(file.mimetype);
      const filename = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${extension}`;
      callback(null, filename);
    },
  });

  console.log('Using local disk storage for profile photos.');
}

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

const getProfilePhotoUrl = (file) => {
  if (!file) return '';
  if (file.path && /^https?:\/\//i.test(file.path)) return file.path;
  return file.filename ? `/uploads/profiles/${file.filename}` : '';
};

const getLocalProfilePhotoPath = (photoUrl) => {
  if (!photoUrl?.startsWith('/uploads/profiles/')) return null;

  return path.join(profileUploadDirectory, path.basename(photoUrl));
};

const removeLocalProfilePhoto = async (photoUrl) => {
  const localPath = getLocalProfilePhotoPath(photoUrl);
  if (!localPath) return;

  try {
    await fsPromises.unlink(localPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Unable to remove local profile photo: ${error.message}`);
    }
  }
};

const getCloudinaryPublicIdFromUrl = (photoUrl) => {
  if (!cloudinary || !/^https?:\/\//i.test(photoUrl || '')) return null;

  try {
    const { pathname } = new URL(photoUrl);
    const uploadMarker = '/upload/';
    const uploadIndex = pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    const uploadPath = pathname.slice(uploadIndex + uploadMarker.length);
    const publicPath = uploadPath.replace(/^v\d+\//, '');
    return publicPath.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

const removeStoredProfilePhoto = async (photoUrl) => {
  if (!photoUrl) return;

  if (photoUrl.startsWith('/uploads/profiles/')) {
    await removeLocalProfilePhoto(photoUrl);
    return;
  }

  const publicId = getCloudinaryPublicIdFromUrl(photoUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });
  } catch (error) {
    console.error(`Unable to remove Cloudinary profile photo: ${error.message}`);
  }
};

const removeUploadedProfilePhoto = async (file) => {
  if (!file) return;

  if (file.path && /^https?:\/\//i.test(file.path)) {
    if (!cloudinary || !file.filename) return;

    try {
      await cloudinary.uploader.destroy(file.filename, { invalidate: true });
    } catch (error) {
      console.error(`Unable to remove Cloudinary profile photo: ${error.message}`);
    }
    return;
  }

  if (file.path) {
    try {
      await fsPromises.unlink(file.path);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Unable to remove uploaded profile photo: ${error.message}`);
      }
    }
  }
};

module.exports = {
  uploadProfilePhoto,
  getProfilePhotoUrl,
  removeStoredProfilePhoto,
  removeUploadedProfilePhoto,
};
