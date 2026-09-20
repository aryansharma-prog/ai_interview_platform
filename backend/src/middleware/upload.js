const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const { ApiError } = require('../utils/apiResponse');

const uploadDir = path.join(process.cwd(), env.upload.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const allowedResumeTypes = ['.pdf', '.doc', '.docx'];
const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.webp'];

function fileFilter(allowed) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new ApiError(400, `Unsupported file type: ${ext}`));
    }
    cb(null, true);
  };
}

const uploadResume = multer({
  storage,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: fileFilter(allowedResumeTypes),
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: fileFilter(allowedImageTypes),
});

module.exports = { uploadResume, uploadAvatar };
