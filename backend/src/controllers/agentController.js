const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Role = require('../models/Role');
const { sendEmail } = require('../services/emailService');
const { sendNotifications } = require('../services/notificationService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/agents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    
    if (isValidExtension && isValidMimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
    }
  }
});

const registerAgent = async (req, res) => {
  try {
    const { 
      name, email, password, mobile, nationality, 
      companyName, companyAddress, panCardNumber, gstNumber,
      aadhaarNumber, msmeNumber
    } = req.body;
    
    const existingEmailUser = await User.findOne({ email, deletedAt: null });
    if (existingEmailUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    if (mobile) {
      const existingMobileUser = await User.findOne({ mobile, deletedAt: null });
      if (existingMobileUser) {
        return res.status(400).json({ message: 'Mobile number already exists' });
      }
    }

    // Get default customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    
    if (!customerRole) {
      return res.status(500).json({ message: 'Default role not found' });
    }

    // Parse company address if it's a string
    let parsedCompanyAddress = companyAddress;
    if (typeof companyAddress === 'string') {
      parsedCompanyAddress = JSON.parse(companyAddress);
    }

    const userData = { 
      name, 
      email, 
      password, 
      mobile, 
      nationality,
      role: customerRole._id,
      isActive: false,
      isAgent: true,
      companyName,
      companyAddress: parsedCompanyAddress,
      panCardNumber,
      gstNumber,
      aadhaarNumber,
      msmeNumber
    };

    // Add file paths if files were uploaded
    if (req.files) {
      if (req.files.panCardPhoto) {
        userData.panCardPhoto = req.files.panCardPhoto[0].filename;
      }
      if (req.files.gstFile) {
        userData.gstFile = req.files.gstFile[0].filename;
      }
      if (req.files.aadhaarFile) {
        userData.aadhaarFile = req.files.aadhaarFile[0].filename;
      }
      if (req.files.msmeFile) {
        userData.msmeFile = req.files.msmeFile[0].filename;
      }
      if (req.files.cancelledChequeFile) {
        userData.cancelledChequeFile = req.files.cancelledChequeFile[0].filename;
      }
    }

    const user = new User(userData);
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('role');
    
    // Send registration confirmation email
    try {
      await sendEmail(user.email, 'agentRegistration', {
        userName: user.name,
        companyName: user.companyName
      });
    } catch (emailError) {
      console.error('Failed to send agent registration email:', emailError);
    }
    
    // Send welcome notifications for agent
    sendNotifications(email, mobile, 'agentRegistration', {
      userName: user.name,
      companyName: user.companyName
    }, 'agentRegistration', {
      userName: user.name,
      companyName: user.companyName
    });
    
    res.status(201).json({
      message: 'Agent registration successful. Your application is under review.',
      user: { 
        id: populatedUser._id, 
        name: populatedUser.name, 
        email: populatedUser.email, 
        role: populatedUser.role.name, 
        isActive: populatedUser.isActive,
        isAgent: populatedUser.isAgent
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    if (updates.companyAddress && typeof updates.companyAddress === 'string') {
      updates.companyAddress = JSON.parse(updates.companyAddress);
    }
    
    if (req.files) {
      if (req.files.panCardPhoto) {
        updates.panCardPhoto = req.files.panCardPhoto[0].filename;
      }
      if (req.files.gstFile) {
        updates.gstFile = req.files.gstFile[0].filename;
      }
      if (req.files.aadhaarFile) {
        updates.aadhaarFile = req.files.aadhaarFile[0].filename;
      }
      if (req.files.msmeFile) {
        updates.msmeFile = req.files.msmeFile[0].filename;
      }
      if (req.files.cancelledChequeFile) {
        updates.cancelledChequeFile = req.files.cancelledChequeFile[0].filename;
      }
    }
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .populate('role');
      
    if (!user) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ message: 'Agent updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerAgent, updateAgent, upload };