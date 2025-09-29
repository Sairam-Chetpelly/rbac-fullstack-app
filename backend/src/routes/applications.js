const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const ApplicationAnswer = require('../models/ApplicationAnswer');
const ApplicationDocument = require('../models/ApplicationDocument');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { sendEmail, sendAdminNotification } = require('../services/emailService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/applications';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Word documents are allowed'));
    }
  }
});

// Get all applications (admin only)
router.get('/', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const applications = await Application.find({ deletedAt: null })
      .populate('user', 'name email')
      .populate({
        path: 'countryVisaType',
        populate: {
          path: 'country',
          select: 'name flagEmoji'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get single application details (admin only)
router.get('/:id', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const Applicant = require('../models/Applicant');
    
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate({
        path: 'countryVisaType',
        populate: [
          { path: 'country', select: 'name flagEmoji' },
          { path: 'visaType', select: 'name' }
        ]
      })
      .lean();

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Get applicants
    const applicants = await Applicant.find({ application: req.params.id, deletedAt: null })
      .sort({ applicantIndex: 1 })
      .lean();

    // Get application answers
    const answers = await ApplicationAnswer.find({ application: req.params.id })
      .populate('field', 'name label type')
      .lean();

    // Get application documents
    const documents = await ApplicationDocument.find({ application: req.params.id })
      .lean();

    // Get status history
    const statusHistory = await ApplicationStatusHistory.find({ application: req.params.id })
      .populate('changedBy', 'name')
      .sort({ changedAt: -1 })
      .lean();

    // Get payment information
    const payment = await Payment.findOne({ application: req.params.id })
      .lean();

    res.json({
      application,
      applicants,
      answers,
      documents,
      statusHistory,
      payment
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ message: 'Error fetching application details', error: error.message });
  }
});

// Update application status (admin only)
router.put('/:id/status', auth, role(['admin']), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    const application = await Application.findById(req.params.id).populate('user', 'name email');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const oldStatus = application.status;
    
    // Update application status
    application.status = status;
    await application.save();

    // Create status history entry
    await ApplicationStatusHistory.create({
      application: req.params.id,
      status,
      remarks: remarks || '',
      changedBy: req.user.id
    });

    // Send status update emails
    const User = require('../models/User');
    const updatedBy = await User.findById(req.user.id);
    
    // Email to customer
    await sendEmail(application.user.email, 'statusUpdate', {
      userName: application.user.name,
      applicationId: application.applicationNumber,
      status: status,
      remarks: remarks
    });
    
    // Email to admin
    await sendAdminNotification('adminStatusUpdate', {
      applicationId: application.applicationNumber,
      userName: application.user.name,
      oldStatus: oldStatus,
      newStatus: status,
      updatedBy: updatedBy.name
    });

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

// Delete application (admin only)
router.delete('/:id', auth, role(['admin']), async (req, res) => {
  try {
    await Application.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error deleting application', error: error.message });
  }
});

module.exports = router;