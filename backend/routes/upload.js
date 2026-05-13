const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * POST /api/upload
 * Accepts a single image file (field name: "image").
 * Returns the Cloudinary secure URL.
 */
router.post('/', authMiddleware, (req, res) => {
  console.log('--- UPLOAD REQUEST RECEIVED ---');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Upload Error:', err);
      // Multer or file-filter error (e.g. non-image uploaded)
      return res.status(400).json({
        error: err.message || 'File upload failed. Only image files are allowed.',
      });
    }

    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'No file was provided.' });
    }

    console.log('✅ Upload Success:', req.file.path);
    return res.status(200).json({
      url: req.file.path,          // Cloudinary secure URL
      public_id: req.file.filename // Cloudinary public_id
    });
  });
});

module.exports = router;
