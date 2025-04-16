const multer = require('multer');
const cloudinary = require('../util/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pixit',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const fileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
