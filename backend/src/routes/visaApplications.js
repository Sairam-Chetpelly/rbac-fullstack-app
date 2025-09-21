const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

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

// Create Razorpay order
router.post('/create-payment-order', auth, async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const { visaTypeId, amount } = req.body;
    
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `visa_${Date.now()}`,
      notes: {
        visaTypeId: visaTypeId
      }
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: 'Error creating payment order', error: error.message });
  }
});

// Save visa application draft
router.post('/visa-applications/draft', auth, async (req, res) => {
  try {
    const { visaTypeId, formData } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const Application = require('../models/Application');
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const FormField = require('../models/FormField');
    
    // Create draft application
    const applicationNumber = `DRAFT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const application = new Application({
      user: req.user.id,
      countryVisaType: visaTypeId,
      applicationNumber,
      status: 'draft'
    });
    await application.save();
    
    // Save form answers
    const fields = await FormField.find().lean();
    const fieldMap = fields.reduce((acc, field) => {
      acc[field.name] = field._id;
      return acc;
    }, {});
    
    const answers = [];
    for (const [fieldName, value] of Object.entries(formData)) {
      if (fieldMap[fieldName] && value) {
        answers.push({
          application: application._id,
          field: fieldMap[fieldName],
          answerText: typeof value === 'string' ? value : JSON.stringify(value)
        });
      }
    }
    
    if (answers.length > 0) {
      await ApplicationAnswer.insertMany(answers);
    }
    
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

// Submit visa application with payment
router.post('/visa-applications', auth, upload.any(), async (req, res) => {
  try {
    const { visaTypeId, draftId, paymentId, orderId, signature, ...formData } = req.body;
    
    const Application = require('../models/Application');
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
    const Payment = require('../models/Payment');
    const FormField = require('../models/FormField');
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
      if (!application || application.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Draft not found' });
      }
      application.status = 'submitted';
      application.submittedAt = new Date();
      await application.save();
    } else {
      // Create new application
      const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      application = new Application({
        user: req.user.id,
        countryVisaType: visaTypeId,
        applicationNumber,
        status: 'submitted',
        submittedAt: new Date()
      });
      await application.save();
    }
    
    // Save form answers if not from draft
    if (!draftId) {
      const fields = await FormField.find().lean();
      const fieldMap = fields.reduce((acc, field) => {
        acc[field.name] = field._id;
        return acc;
      }, {});
      
      const answers = [];
      
      // Handle regular form fields
      for (const [fieldName, value] of Object.entries(formData)) {
        if (fieldMap[fieldName] && value) {
          answers.push({
            application: application._id,
            field: fieldMap[fieldName],
            answerText: typeof value === 'string' ? value : JSON.stringify(value)
          });
        }
      }
      
      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const ApplicationDocument = require('../models/ApplicationDocument');
        
        for (const file of req.files) {
          await ApplicationDocument.create({
            application: application._id,
            fieldName: file.fieldname,
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          });
          
          if (fieldMap[file.fieldname]) {
            answers.push({
              application: application._id,
              field: fieldMap[file.fieldname],
              answerText: file.filename
            });
          }
        }
      }
      
      if (answers.length > 0) {
        await ApplicationAnswer.insertMany(answers);
      }
    }
    
    // Create status history
    await ApplicationStatusHistory.create({
      application: application._id,
      status: 'submitted',
      remarks: 'Application submitted with payment',
      changedBy: req.user.id
    });
    
    // Create payment record
    const visaType = await CountryVisaType.findById(visaTypeId);
    const payment = new Payment({
      application: application._id,
      user: req.user.id,
      amount: visaType.totalAmount,
      currency: 'INR',
      status: 'success',
      transactionId: paymentId,
      paymentMethod: 'razorpay',
      razorpayOrderId: orderId,
      razorpaySignature: signature,
      paidAt: new Date()
    });
    await payment.save();
    
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

module.exports = router;