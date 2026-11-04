const multer = require('multer');
const path = require('path');
const { uploadsDir, cloudinary } = require('../config/cloudinary');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: fileFilter,
});

// Helper to get public URL for saved file
const getFileUrl = async (req, file) => {
  if (!file) return '';

  // If Cloudinary is configured, upload to cloud
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'foodlink',
      });
      return result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local file URL:', err.message);
    }
  }

  // Fallback to local server static URL
  return `/uploads/${file.filename}`;
};

module.exports = { upload, getFileUrl };
