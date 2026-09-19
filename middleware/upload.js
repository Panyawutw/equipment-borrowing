// --- Imports & Modules ---
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  }
});

// --- File Validation ---
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('อนุญาตเฉพาะภาพ JPG PNG หรือ WEBP'));
};

// --- Export Upload Middleware ---
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});
