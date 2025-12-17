const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { getUsers, getUserById, createUser, updateUser, deleteUser, changePassword, getProfile, updateProfile, toggleUserStatus } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const json2csv = require('json2csv').parse;
const User = require('../models/User');
const Role = require('../models/Role');

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
  const allowedFields = ['panCardPhoto', 'gstFile', 'aadhaarFile', 'msmeFile', 'cancelledChequeFile'];
  
  if (allowedFields.includes(file.fieldname)) {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error(`${file.fieldname} must be an image or PDF`), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Compression middleware for user files
const compressUserFiles = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  try {
    const fileFields = ['panCardPhoto', 'aadhaarFile', 'gstFile', 'msmeFile', 'cancelledChequeFile'];
    
    for (const fieldName of fileFields) {
      if (req.files[fieldName] && req.files[fieldName][0]) {
        const file = req.files[fieldName][0];
        
        if (file.mimetype.startsWith('image/')) {
          try {
            const { filename, path: filePath } = file;
            const compressedFilename = `compressed-${filename.replace(/\.[^/.]+$/, '')}.jpg`;
            const compressedPath = path.join(path.dirname(filePath), compressedFilename);

            let quality = 85;
            if (file.size > 2 * 1024 * 1024) {
              quality = 70;
            } else if (file.size > 1 * 1024 * 1024) {
              quality = 80;
            }

            await sharp(filePath)
              .resize(1200, 900, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .jpeg({ 
                quality,
                progressive: true
              })
              .toFile(compressedPath);

            fs.unlinkSync(filePath);

            file.filename = compressedFilename;
            file.path = compressedPath;
            file.mimetype = 'image/jpeg';
            
            const stats = fs.statSync(compressedPath);
            file.size = stats.size;
          } catch (compressionError) {
            console.error(`Error compressing ${fieldName}:`, compressionError);
          }
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('User file compression error:', error);
    next();
  }
};

router.get('/', auth, role(['admin', 'manager', 'employee']), getUsers);
router.post('/', auth, role(['admin', 'manager', 'employee']), createUser);
router.put('/change-password', auth, changePassword);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Export users data
router.get('/export/csv', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null })
      .populate('role', 'name')
      .lean();

    const usersData = users.map(user => ({
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      mobile: user.mobile || 'N/A',
      role: user.role?.name || 'N/A',
      isActive: user.isActive ? 'Active' : 'Inactive',
      companyName: user.companyName || 'N/A',
      gstNumber: user.gstNumber || 'N/A',
      panNumber: user.panNumber || 'N/A',
      aadhaarNumber: user.aadhaarNumber || 'N/A',
      address: user.address || 'N/A',
      city: user.city || 'N/A',
      state: user.state || 'N/A',
      pincode: user.pincode || 'N/A',
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'
    }));

    const fields = [
      'name',
      'email', 
      'mobile',
      'role',
      'isActive',
      'companyName',
      'gstNumber',
      'panNumber',
      'aadhaarNumber',
      'address',
      'city',
      'state',
      'pincode',
      'createdAt',
      'lastLogin'
    ];

    const csv = json2csv(usersData, { fields });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Error exporting users', error: error.message });
  }
});

router.get('/:id', auth, role(['admin', 'manager', 'employee']), getUserById);
router.put('/:id', auth, role(['admin', 'manager', 'employee']), upload.fields([
  { name: 'panCardPhoto', maxCount: 1 }, 
  { name: 'gstFile', maxCount: 1 },
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'msmeFile', maxCount: 1 },
  { name: 'cancelledChequeFile', maxCount: 1 }
]), compressUserFiles, updateUser);
router.patch('/:id/toggle-status', auth, role(['admin', 'manager']), toggleUserStatus);
router.delete('/:id', auth, role(['admin']), deleteUser);

module.exports = router;