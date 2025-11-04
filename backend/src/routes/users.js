const express = require('express');
const multer = require('multer');
const path = require('path');
const { getUsers, createUser, updateUser, deleteUser, changePassword, getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/agents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'panCardPhoto') {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PAN card photo must be an image or PDF'), false);
    }
  } else if (file.fieldname === 'gstFile') {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('GST file must be a PDF or image'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.get('/', auth, role(['admin', 'manager', 'employee']), getUsers);
router.post('/', auth, role(['admin', 'manager', 'employee']), createUser);
router.put('/change-password', auth, changePassword);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/:id', auth, role(['admin', 'manager', 'employee']), upload.fields([{ name: 'panCardPhoto', maxCount: 1 }, { name: 'gstFile', maxCount: 1 }]), updateUser);
router.delete('/:id', auth, role(['admin']), deleteUser);

module.exports = router;