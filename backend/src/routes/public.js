const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Country = require('../models/Country');
const Continent = require('../models/Continent');
const CountryVisaType = require('../models/CountryVisaType');
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

// Get countries for home page (public)
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.find()
      .populate('continent', 'name')
      .populate('status', 'name')
      .lean();

    // Get visa types for each country
    const countriesWithVisaTypes = await Promise.all(
      countries.map(async (country) => {
        const visaTypes = await CountryVisaType.find({ country: country._id })
          .populate('visaType', 'name')
          .lean();

        return {
          id: country._id,
          name: country.name,
          code: country.code,
          flag_emoji: country.flagEmoji,
          flagEmoji: country.flagEmoji,
          continent: country.continent?.name,
          region: country.continent?.name,
          processing_time_min: country.processingTimeMin,
          processing_time_max: country.processingTimeMax,
          processingTimeMin: country.processingTimeMin,
          processingTimeMax: country.processingTimeMax,
          visa_types: visaTypes.map(vt => ({
            id: vt._id,
            name: vt.name,
            fee: parseFloat(vt.totalAmount) || 0
          }))
        };
      })
    );

    res.json(countriesWithVisaTypes);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ message: 'Error fetching countries', error: error.message });
  }
});

// Get continents for home page (public)
router.get('/continents', async (req, res) => {
  try {
    const continents = await Continent.find()
      .populate('status', 'name')
      .lean();

    const continentNames = continents.map(continent => continent.name);
    res.json(['All', ...continentNames]);
  } catch (error) {
    console.error('Error fetching continents:', error);
    res.status(500).json({ message: 'Error fetching continents', error: error.message });
  }
});

// Get single country (public)
router.get('/countries/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id)
      .populate('continent', 'name')
      .populate('status', 'name')
      .lean();

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    res.json({
      id: country._id,
      name: country.name,
      code: country.code,
      flagEmoji: country.flagEmoji,
      continent: country.continent?.name,
      processingTimeMin: country.processingTimeMin,
      processingTimeMax: country.processingTimeMax
    });
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ message: 'Error fetching country', error: error.message });
  }
});

// Get visa types for a country (public)
router.get('/countries/:id/visa-types', async (req, res) => {
  try {
    const visaTypes = await CountryVisaType.find({ country: req.params.id })
      .populate('visaType', 'name')
      .populate('status', 'name')
      .lean();

    const formattedVisaTypes = visaTypes.map(vt => ({
      _id: vt._id,
      name: vt.name,
      description: vt.description,
      processingTimeMin: vt.processingTimeMin,
      processingTimeMax: vt.processingTimeMax,
      vfsAmount: vt.vfsAmount,
      consulateAmount: vt.consulateAmount,
      serviceAmount: vt.serviceAmount,
      totalAmount: vt.totalAmount
    }));

    res.json(formattedVisaTypes);
  } catch (error) {
    console.error('Error fetching visa types:', error);
    res.status(500).json({ message: 'Error fetching visa types', error: error.message });
  }
});

// Get visa type details (public)
router.get('/visa-types/:id', async (req, res) => {
  try {
    const visaType = await CountryVisaType.findById(req.params.id)
      .populate('country', 'name flagEmoji')
      .populate('visaType', 'name')
      .lean();

    if (!visaType) {
      return res.status(404).json({ message: 'Visa type not found' });
    }

    res.json({
      visaType: {
        _id: visaType._id,
        name: visaType.name,
        description: visaType.description,
        processingTimeMin: visaType.processingTimeMin,
        processingTimeMax: visaType.processingTimeMax,
        vfsAmount: visaType.vfsAmount,
        consulateAmount: visaType.consulateAmount,
        serviceAmount: visaType.serviceAmount,
        totalAmount: visaType.totalAmount
      },
      country: visaType.country
    });
  } catch (error) {
    console.error('Error fetching visa type:', error);
    res.status(500).json({ message: 'Error fetching visa type', error: error.message });
  }
});

// Get terms and conditions for visa type (public)
router.get('/visa-types/:id/terms-conditions', async (req, res) => {
  try {
    const VisaTermsConditions = require('../models/VisaTermsConditions');
    const CountryTermsConditions = require('../models/CountryTermsConditions');
    
    // Get visa type details to find the country
    const visaType = await CountryVisaType.findById(req.params.id)
      .populate('country', 'name')
      .lean();
    
    if (!visaType) {
      return res.status(404).json({ message: 'Visa type not found' });
    }
    
    // Get visa-specific terms and conditions
    const visaTerms = await VisaTermsConditions.find({ countryVisaType: req.params.id })
      .lean();
    
    // Get country-specific terms and conditions
    const countryTerms = await CountryTermsConditions.find({ country: visaType.country._id })
      .lean();
    
    // Combine both types of terms
    const allTerms = [
      ...visaTerms.map(term => ({
        _id: term._id,
        title: term.title,
        content: term.content,
        type: 'visa-specific'
      })),
      ...countryTerms.map(term => ({
        _id: term._id,
        title: term.title,
        content: term.content,
        type: 'country-general'
      }))
    ];
    
    console.log(`Found ${allTerms.length} terms and conditions for visa type ${req.params.id}`);
    
    res.json(allTerms);
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    res.status(500).json({ message: 'Error fetching terms and conditions', error: error.message });
  }
});

// Get form fields for visa type (public)
router.get('/visa-types/:id/form', async (req, res) => {
  try {
    const FormSection = require('../models/FormSection');
    const FormField = require('../models/FormField');
    
    // Find sections for this specific visa type
    const sections = await FormSection.find({ countryVisaType: req.params.id })
      .sort({ order: 1 })
      .lean();
    
    // Find fields for these sections
    const sectionIds = sections.map(section => section._id);
    const fields = await FormField.find({ formSection: { $in: sectionIds } })
      .sort({ order: 1 })
      .lean();
    
    console.log(`Found ${sections.length} sections and ${fields.length} fields for visa type ${req.params.id}`);
    
    res.json({ sections, fields });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ message: 'Error fetching form data', error: error.message });
  }
});

// Create Razorpay order
router.post('/create-payment-order', async (req, res) => {
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

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;
    const crypto = require('crypto');
    
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret')
      .update(body.toString())
      .digest('hex');
    
    const isValid = expectedSignature === signature;
    res.json({ isValid });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});

// Submit visa application with payment (authenticated)
router.post('/visa-applications', auth, upload.any(), async (req, res) => {
  try {
    const { visaTypeId, draftId, paymentId, orderId, signature, ...formData } = req.body;
    
    const Application = require('../models/Application');
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
    const Payment = require('../models/Payment');
    const FormField = require('../models/FormField');
    const Razorpay = require('razorpay');
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
    
    // Save form answers
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
    
    // Create initial status history
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
    
    console.log('Visa application submitted with payment:', application.applicationNumber);
    
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

// Save visa application draft (authenticated)
router.post('/visa-applications/draft', auth, async (req, res) => {
  try {
    const { visaTypeId, formData } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const Application = require('../models/Application');
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const FormField = require('../models/FormField');
    
    console.log('Creating draft for user:', req.user.id);
    
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
    
    console.log('Visa application draft saved:', application.applicationNumber);
    
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

module.exports = router;