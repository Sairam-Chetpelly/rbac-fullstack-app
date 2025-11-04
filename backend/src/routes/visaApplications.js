const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { sendEmail, sendAdminNotification } = require('../services/emailService');
const compressImage = require('../middleware/imageCompression');
const compressMultipleImages = require('../middleware/imageCompressionMultiple');
const User = require('../models/User');

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
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files per request
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.originalname}. Only images, PDFs, and Word documents are supported.`));
    }
  }
});

// Single file upload endpoint
router.post('/visa-applications/upload-single', auth, upload.single('file'), compressImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      filePath: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({ message: 'Error processing uploaded file', error: error.message });
  }
});

// File upload endpoint - supports multiple files (legacy)
router.post('/visa-applications/upload', auth, upload.array('files', 10), compressMultipleImages, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      filePath: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({ 
      success: true, 
      files: uploadedFiles,
      count: uploadedFiles.length
    });
  } catch (error) {
    console.error('Error processing uploaded files:', error);
    res.status(500).json({ message: 'Error processing uploaded files', error: error.message });
  }
});

// Save visa application draft
router.post('/visa-applications/draft', auth, async (req, res) => {
  try {
    const { visaTypeId, formData, applicationType = 'individual', numberOfApplicants = 1 } = req.body;
    
    console.log('Draft request - User:', req.user);
    console.log('Draft request - Body:', { visaTypeId, formData, applicationType, numberOfApplicants });
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const Application = require('../models/Application');
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const Applicant = require('../models/Applicant');
    const FormField = require('../models/FormField');
    const Status = require('../models/Status');
    
    // Get draft status
    const draftStatus = await Status.findOne({ name: 'draft' });
    console.log('Draft status:', draftStatus);
    if (!draftStatus) {
      return res.status(500).json({ message: 'Draft status not found' });
    }
    
    // Create draft application
    const applicationNumber = `DRAFT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const application = new Application({
      user: req.user._id,
      countryVisaType: visaTypeId,
      applicationNumber,
      applicationType,
      numberOfApplicants,
      status: draftStatus._id
    });
    await application.save();
    
    // Create applicant records
    const applicants = [];
    for (let i = 0; i < numberOfApplicants; i++) {
      applicants.push({
        application: application._id,
        applicantIndex: i,
        relationship: 'self'
      });
    }
    await Applicant.insertMany(applicants);
    
    // Save form answers
    const fields = await FormField.find().lean();
    const fieldMap = fields.reduce((acc, field) => {
      acc[field.name] = field._id;
      return acc;
    }, {});
    
    const answers = [];
    
    // Handle multi-applicant form data
    if (Array.isArray(formData)) {
      // Array format: each element is data for one applicant
      formData.forEach((applicantData, index) => {
        for (const [fieldName, value] of Object.entries(applicantData)) {
          if (fieldMap[fieldName] && value !== '' && value !== null && value !== undefined) {
            answers.push({
              application: application._id,
              applicantIndex: index,
              field: fieldMap[fieldName],
              answerText: typeof value === 'string' ? value : JSON.stringify(value)
            });
          }
        }
      });
    } else {
      // Single applicant format
      for (const [fieldName, value] of Object.entries(formData)) {
        if (fieldMap[fieldName] && value) {
          answers.push({
            application: application._id,
            applicantIndex: 0,
            field: fieldMap[fieldName],
            answerText: typeof value === 'string' ? value : JSON.stringify(value)
          });
        }
      }
    }
    
    if (answers.length > 0) {
      await ApplicationAnswer.insertMany(answers);
    }
    
    // Send draft creation email
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    await sendEmail(user.email, 'draftCreated', { 
      userName: user.name, 
      applicationId: application.applicationNumber 
    });
    
    res.json({ 
      success: true, 
      draftId: application._id,
      applicationNumber: application.applicationNumber,
      message: 'Draft saved successfully' 
    });
  } catch (error) {
    console.error('Error saving visa application draft:', error);
    res.status(500).json({ message: 'Error saving draft', error: error.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Visa applications router is working' });
});

// Health check for visa applications
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug route to check all applications
router.get('/debug/applications', async (req, res) => {
  try {
    const Application = require('../models/Application');
    const applications = await Application.find({}).limit(10);
    res.json({
      count: applications.length,
      applications: applications.map(app => ({
        id: app._id,
        user: app.user,
        applicationNumber: app.applicationNumber,
        status: app.status
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit draft application (change status from draft to submitted)
router.post('/visa-applications/submit-draft', auth, async (req, res) => {
  try {
    const { draftId, formData } = req.body;
    
    if (!draftId) {
      return res.status(400).json({ message: 'Draft ID is required' });
    }
    
    const Application = require('../models/Application');
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
    const FormField = require('../models/FormField');
    
    // Find and verify draft belongs to user
    const application = await Application.findOne({
      _id: draftId,
      user: req.user._id,
      status: 'draft',
      deletedAt: null
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Update form answers
    if (formData) {
      const fields = await FormField.find().lean();
      const fieldMap = fields.reduce((acc, field) => {
        acc[field.name] = field._id;
        return acc;
      }, {});
      
      // Delete existing answers
      await ApplicationAnswer.deleteMany({ application: application._id });
      
      // Save new answers
      const answers = [];
      for (const [fieldName, value] of Object.entries(formData)) {
        if (fieldMap[fieldName] && value !== '' && value !== null && value !== undefined) {
          const field = fields.find(f => f.name === fieldName);
          const answer = {
            application: application._id,
            field: fieldMap[fieldName]
          };
          
          if (field && field.type === 'file' && typeof value === 'string') {
            answer.answerFile = value;
          } else {
            answer.answerText = typeof value === 'string' ? value : JSON.stringify(value);
          }
          
          answers.push(answer);
        }
      }
      
      if (answers.length > 0) {
        await ApplicationAnswer.insertMany(answers);
      }
    }
    
    // Get submitted status
    const Status = require('../models/Status');
    const submittedStatus = await Status.findOne({ name: 'submitted' });
    if (!submittedStatus) {
      return res.status(500).json({ message: 'Submitted status not found' });
    }
    
    // Update application status
    application.applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    application.status = submittedStatus._id;
    application.submittedAt = new Date();
    await application.save();
    
    // Create status history
    await ApplicationStatusHistory.create({
      application: application._id,
      status: submittedStatus._id,
      remarks: 'Application submitted from draft',
      changedBy: req.user._id
    });
    
    res.json({ 
      success: true, 
      applicationId: application._id,
      applicationNumber: application.applicationNumber,
      message: 'Application submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting draft application:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Submit visa application without payment
router.post('/visa-applications/submit-without-payment', auth, async (req, res) => {
  try {
    console.log('Submit without payment request body:', req.body);
    console.log('Submit without payment request user:', req.user);
    
    const { visaTypeId, draftId, formData, applicationType = 'individual', numberOfApplicants = 1, relationships = [] } = req.body;
    
    if (!visaTypeId) {
      return res.status(400).json({ message: 'Visa type ID is required' });
    }
    
    const Application = require('../models/Application');
    const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
    const Status = require('../models/Status');
    
    let application;
    if (draftId) {
      // Update existing draft
      application = await Application.findById(draftId);
      if (!application || application.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Draft not found' });
      }
      
      // Get submitted status
      const submittedStatus = await Status.findOne({ name: 'submitted' });
      if (!submittedStatus) {
        return res.status(500).json({ message: 'Submitted status not found' });
      }
      
      // Change application number from DRAFT to APP
      application.applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      application.status = submittedStatus._id;
      application.submittedAt = new Date();
      await application.save();
    } else {
      // Get submitted status
      const submittedStatus = await Status.findOne({ name: 'submitted' });
      if (!submittedStatus) {
        return res.status(500).json({ message: 'Submitted status not found' });
      }
      
      // Create new application
      const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      application = new Application({
        user: req.user._id,
        countryVisaType: visaTypeId,
        applicationNumber,
        status: submittedStatus._id,
        applicationType,
        numberOfApplicants,
        submittedAt: new Date()
      });
      await application.save();
    }
    
    // Create status history
    const submittedStatus = await Status.findOne({ name: 'submitted' });
    await ApplicationStatusHistory.create({
      application: application._id,
      status: submittedStatus._id,
      remarks: 'Application submitted - payment pending',
      changedBy: req.user._id
    });
    
    // Create payment entry with pending status
    const CountryVisaType = require('../models/CountryVisaType');
    const Payment = require('../models/Payment');
    const visaTypeData = await CountryVisaType.findById(visaTypeId);
    const userData = await User.findById(req.user._id);
    
    if (visaTypeData) {
      // Use agent discount if user is agent, otherwise use regular amount
      const unitAmount = userData.isAgent ? 
        (visaTypeData.agentDiscount || visaTypeData.totalAmount) : 
        visaTypeData.totalAmount;
      const totalAmount = (unitAmount || 0) * numberOfApplicants;
      
      await Payment.create({
        application: application._id,
        user: req.user._id,
        amount: totalAmount.toString(),
        currency: 'INR',
        status: 'pending',
        paymentMethod: 'agent_contact'
      });
    }
    
    // Send application submission emails
    const user = userData;
    
    // Email to customer
    sendEmail(user.email, 'applicationSubmitted', { 
      userName: user.name, 
      applicationId: application.applicationNumber 
    });
    
    // Email to admin
    sendAdminNotification('adminNewApplication', {
      applicationId: application.applicationNumber,
      userName: user.name,
      userEmail: user.email
    });
    
    res.json({ 
      success: true, 
      applicationId: application._id,
      applicationNumber: application.applicationNumber,
      message: 'Application submitted successfully - agent will contact for payment' 
    });
  } catch (error) {
    console.error('Error submitting visa application without payment:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Submit visa application with payment
router.post('/visa-applications/submit', auth, upload.any(), compressMultipleImages, async (req, res) => {
  try {
    console.log('Submit request body:', req.body);
    console.log('Submit request files:', req.files);
    console.log('Submit request user:', req.user);
    
    const { visaTypeId, draftId, paymentId, orderId, signature, formData, applicationType = 'individual', numberOfApplicants = 1, relationships = [] } = req.body;
    
    if (!visaTypeId || !paymentId || !orderId || !signature) {
      return res.status(400).json({ message: 'Missing required payment information' });
    }
    
    const Application = require('../models/Application');
    const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
    const Payment = require('../models/Payment');
    const CountryVisaType = require('../models/CountryVisaType');
    const crypto = require('crypto');
    
    // Verify payment signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    
    let application;
    if (draftId) {
      // Update existing draft
      application = await Application.findById(draftId);
      if (!application || application.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Draft not found' });
      }
      // Get submitted status
      const Status = require('../models/Status');
      const submittedStatus = await Status.findOne({ name: 'Submitted' });
      if (!submittedStatus) {
        return res.status(500).json({ message: 'Submitted status not found' });
      }
      
      // Change application number from DRAFT to APP
      application.applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      application.status = submittedStatus._id;
      application.submittedAt = new Date();
      await application.save();
    } else {
      // Get submitted status
      const Status = require('../models/Status');
      const submittedStatus = await Status.findOne({ name: 'Submitted' });
      if (!submittedStatus) {
        return res.status(500).json({ message: 'Submitted status not found' });
      }
      
      // Create new application
      const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      application = new Application({
        user: req.user._id,
        countryVisaType: visaTypeId,
        applicationNumber,
        status: submittedStatus._id,
        submittedAt: new Date()
      });
      await application.save();
    }
    
    // Create status history
    const Status = require('../models/Status');
    const submittedStatus = await Status.findOne({ name: 'Submitted' });
    await ApplicationStatusHistory.create({
      application: application._id,
      status: submittedStatus._id,
      remarks: 'Application submitted with payment',
      changedBy: req.user._id
    });
    
    // Create payment record
    const visaType = await CountryVisaType.findById(visaTypeId);
    if (!visaType) {
      return res.status(404).json({ message: 'Visa type not found' });
    }
    
    const userData = await User.findById(req.user._id);
    
    // Use agent discount if user is agent, otherwise use regular amount
    const unitAmount = userData.isAgent ? 
      (visaType.agentDiscount || visaType.totalAmount) : 
      visaType.totalAmount;
    const totalAmount = (unitAmount || 0) * numberOfApplicants;
    const payment = new Payment({
      application: application._id,
      user: req.user._id,
      amount: totalAmount.toString(),
      currency: 'INR',
      status: 'success',
      transactionId: paymentId,
      paymentMethod: 'razorpay',
      razorpayOrderId: orderId,
      razorpaySignature: signature,
      paidAt: new Date()
    });
    await payment.save();
    
    // Send application submission emails
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    // Email to customer
    await sendEmail(user.email, 'applicationSubmitted', { 
      userName: user.name, 
      applicationId: application.applicationNumber 
    });
    
    // Email to admin
    await sendAdminNotification('adminNewApplication', {
      applicationId: application.applicationNumber,
      userName: user.name,
      userEmail: user.email
    });
    
    res.json({ 
      success: true, 
      applicationId: application._id,
      applicationNumber: application.applicationNumber,
      message: 'Application submitted successfully with payment' 
    });
  } catch (error) {
    console.error('Error submitting visa application:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Get customer's applications
router.get('/customer/applications', auth, async (req, res) => {
  try {
    console.log('Customer applications request - User ID:', req.user._id);
    
    const Application = require('../models/Application');
    
    // First, let's see all applications for debugging
    const allApps = await Application.find({ deletedAt: null });
    console.log('All applications:', allApps.map(app => ({ id: app._id, user: app.user, appNumber: app.applicationNumber })));
    
    const applications = await Application.find({ 
      user: req.user._id,
      deletedAt: null 
    })
    .populate({
      path: 'countryVisaType',
      populate: {
        path: 'country',
        select: 'name placeImage'
      }
    })
    .sort({ createdAt: -1 });
    
    console.log('Found applications for user:', applications.length);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching customer applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get customer's payments
router.get('/customer/payments', auth, async (req, res) => {
  try {
    console.log('Customer payments request - User ID:', req.user._id);
    
    const Payment = require('../models/Payment');
    
    // First, let's see all payments for debugging
    const allPayments = await Payment.find({ deletedAt: null });
    console.log('All payments:', allPayments.map(p => ({ id: p._id, user: p.user, amount: p.amount })));
    
    const payments = await Payment.find({ 
      user: req.user._id,
      deletedAt: null 
    })
    .populate({
      path: 'application',
      populate: {
        path: 'countryVisaType',
        populate: {
          path: 'country',
          select: 'name placeImage'
        }
      }
    })
    .sort({ createdAt: -1 });
    
    console.log('Found payments for user:', payments.length);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Get visa type with user-specific pricing
router.get('/visa-types/:id', auth, async (req, res) => {
  try {
    const CountryVisaType = require('../models/CountryVisaType');
    
    const visaType = await CountryVisaType.findById(req.params.id)
      .populate('country', 'name placeImage')
      .populate('visaType', 'name')
      .lean();

    if (!visaType) {
      return res.status(404).json({ message: 'Visa type not found' });
    }

    const userData = await User.findById(req.user._id);
    
    // Return agent-specific pricing
    const finalAmount = userData.isAgent ? 
      (visaType.agentDiscount || visaType.totalAmount) : 
      visaType.totalAmount;

    res.json({
      visaType: {
        _id: visaType._id,
        name: visaType.name,
        description: visaType.description,
        processingTimeMin: visaType.processingTimeMin,
        processingTimeMax: visaType.processingTimeMax,
        totalAmount: finalAmount,
        agentDiscount: visaType.agentDiscount
      },
      country: visaType.country
    });
  } catch (error) {
    console.error('Error fetching visa type:', error);
    res.status(500).json({ message: 'Error fetching visa type', error: error.message });
  }
});

// Get customer dashboard stats
router.get('/customer/stats', auth, async (req, res) => {
  try {
    console.log('Customer stats request - User ID:', req.user._id);
    
    const Application = require('../models/Application');
    const Payment = require('../models/Payment');
    const Status = require('../models/Status');
    
    // Get draft status ID
    const draftStatus = await Status.findOne({ name: 'Draft' });
    
    const [totalApplications, draftApplications, submittedApplications, totalPayments] = await Promise.all([
      Application.countDocuments({ user: req.user._id, deletedAt: null }),
      draftStatus ? Application.countDocuments({ user: req.user._id, status: draftStatus._id, deletedAt: null }) : 0,
      draftStatus ? Application.countDocuments({ user: req.user._id, status: { $ne: draftStatus._id }, deletedAt: null }) : Application.countDocuments({ user: req.user._id, deletedAt: null }),
      Payment.aggregate([
        { $match: { user: req.user._id, status: 'success', deletedAt: null } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
      ])
    ]);
    
    console.log('Stats:', { totalApplications, draftApplications, submittedApplications, totalPayments: totalPayments[0]?.total || 0 });
    
    res.json({
      totalApplications,
      draftApplications,
      submittedApplications,
      totalPayments: totalPayments[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;