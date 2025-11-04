const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Role = require('../models/Role');
const Status = require('../models/Status');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
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
      companyName, companyAddress, panCardNumber, gstNumber 
    } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get default customer role and inactive status
    const customerRole = await Role.findOne({ name: 'customer' });
    const inactiveStatus = await Status.findOne({ name: 'inactive' });
    
    if (!customerRole || !inactiveStatus) {
      return res.status(500).json({ message: 'Default role or status not found' });
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
      status: inactiveStatus._id,
      isAgent: true,
      companyName,
      companyAddress: parsedCompanyAddress,
      panCardNumber,
      gstNumber
    };

    // Add file paths if files were uploaded
    if (req.files) {
      if (req.files.panCardPhoto) {
        userData.panCardPhoto = req.files.panCardPhoto[0].filename;
      }
      if (req.files.gstFile) {
        userData.gstFile = req.files.gstFile[0].filename;
      }
    }

    const user = new User(userData);
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('role').populate('status');
    
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
    const welcomeMessage = `Welcome to One World Visa Agent Network, ${name}! 🎉\n\nThank you for applying to become our agent. Your application is under review and you will be notified once approved.\n\nFor any assistance, contact us anytime.\n\nThank you for choosing us! ✈️`;
    sendNotifications(email, mobile, 'agentWelcome', { userName: name }, welcomeMessage);
    
    res.status(201).json({
      message: 'Agent registration successful. Your application is under review.',
      user: { 
        id: populatedUser._id, 
        name: populatedUser.name, 
        email: populatedUser.email, 
        role: populatedUser.role.name, 
        status: populatedUser.status.name,
        isAgent: populatedUser.isAgent
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerAgent, upload };