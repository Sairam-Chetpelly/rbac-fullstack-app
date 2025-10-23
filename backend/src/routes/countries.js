const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getCountries, createCountry, updateCountry, deleteCountry } = require('../controllers/countryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const compressImage = require('../middleware/imageCompression');

const router = express.Router();

// Configure multer for country image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/countries';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'country-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'));
    }
  }
});

router.get('/', auth, role(['admin']), getCountries);
router.post('/', auth, role(['admin']), upload.single('placeImage'), compressImage, createCountry);
router.put('/:id', auth, role(['admin']), upload.single('placeImage'), compressImage, updateCountry);
router.delete('/:id', auth, role(['admin']), deleteCountry);

module.exports = router;