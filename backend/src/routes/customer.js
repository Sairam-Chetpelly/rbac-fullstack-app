const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Status = require('../models/Status');
const ApplicationAnswer = require('../models/ApplicationAnswer');
const ApplicationDocument = require('../models/ApplicationDocument');
const FormField = require('../models/FormField');
const FormSection = require('../models/FormSection');
const Applicant = require('../models/Applicant');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { sendEmail } = require('../services/emailService');

// Get customer dashboard stats
router.get('/dashboard-stats', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const userId = req.user._id;
    
    const applications = await Application.find({ user: userId, deletedAt: null }).populate('status', 'name');
    const payments = await Payment.find({ user: userId, deletedAt: null });
    
    const stats = {
      total_applications: applications.length,
      approved: applications.filter(app => app.status?.name?.toLowerCase().includes('approved')).length,
      under_review: applications.filter(app => app.status?.name?.toLowerCase().includes('review')).length,
      rejected: applications.filter(app => app.status?.name?.toLowerCase().includes('rejected')).length,
      draft: applications.filter(app => app.status?.name?.toLowerCase().includes('draft')).length,
      total_payments: payments.length,
      total_amount_paid: payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// Get customer applications with pagination and search
router.get('/applications', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      country = '', 
      dateRange = '',
      applicationType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate = '',
      endDate = ''
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { user: req.user._id, deletedAt: null };
    
    // Search filter
    if (search) {
      query.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      const statusDoc = await Status.findOne({ name: { $regex: status, $options: 'i' } });
      if (statusDoc) query.status = statusDoc._id;
    }
    
    // Application type filter
    if (applicationType) {
      query.applicationType = applicationType;
    }
    
    // Custom date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (dateRange) {
      const now = new Date();
      let startDateCalc;
      
      switch (dateRange) {
        case 'today':
          startDateCalc = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDateCalc = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateCalc = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDateCalc = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDateCalc = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDateCalc) {
        query.createdAt = { $gte: startDateCalc };
      }
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const applications = await Application.find(query)
      .populate('status', 'name color')
      .populate({
        path: 'countryVisaType',
        populate: [
          { path: 'country', select: 'name placeImage' },
          { path: 'visaType', select: 'name' }
        ]
      })
      .populate('assignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Country filter (post-populate)
    let filteredApplications = applications;
    if (country) {
      filteredApplications = applications.filter(app => 
        app.countryVisaType?.country?.name?.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    const total = await Application.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      applications: filteredApplications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get customer payments with pagination and search
router.get('/payments', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      dateRange = '',
      paymentMethod = '',
      amountRange = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate = '',
      endDate = ''
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { user: req.user._id, deletedAt: null };
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    // Amount range filter
    if (amountRange) {
      switch (amountRange) {
        case 'under-1000':
          query.amount = { $lt: 1000 };
          break;
        case '1000-5000':
          query.amount = { $gte: 1000, $lt: 5000 };
          break;
        case '5000-10000':
          query.amount = { $gte: 5000, $lt: 10000 };
          break;
        case 'above-10000':
          query.amount = { $gte: 10000 };
          break;
      }
    }
    
    // Custom date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (dateRange) {
      const now = new Date();
      let startDateCalc;
      
      switch (dateRange) {
        case 'today':
          startDateCalc = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDateCalc = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateCalc = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDateCalc = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDateCalc = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDateCalc) {
        query.createdAt = { $gte: startDateCalc };
      }
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const payments = await Payment.find(query)
      .populate({
        path: 'application',
        select: 'applicationNumber',
        populate: {
          path: 'countryVisaType',
          populate: {
            path: 'country',
            select: 'name'
          }
        }
      })
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Search filter (post-populate)
    let filteredPayments = payments;
    if (search) {
      filteredPayments = payments.filter(payment => 
        payment.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
        payment.application?.applicationNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = await Payment.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      payments: filteredPayments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Get draft application details with form data
router.get('/draft/:id', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const draftStatus = await Status.findOne({ name: 'draft' });
    console.log('Draft status:', draftStatus);
    if (!draftStatus) {
      return res.status(500).json({ message: 'Draft status not found' });
    }
    
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: draftStatus._id,
      deletedAt: null
    }).populate({
      path: 'countryVisaType',
      populate: [
        { path: 'country', select: 'name placeImage' },
        { path: 'visaType', select: 'name' }
      ]
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Get form answers
    const answers = await ApplicationAnswer.find({
      application: application._id,
      deletedAt: null
    }).populate('field', 'name');
    
    // Get applicants
    const applicants = await Applicant.find({
      application: application._id,
      deletedAt: null
    }).sort({ applicantIndex: 1 });
    
    // Convert answers to form data structure
    let formData;
    
    if (application.applicationType === 'individual') {
      // Single applicant format
      formData = {};
      answers.forEach(answer => {
        if (answer.field && answer.field.name) {
          if (answer.answerFiles && answer.answerFiles.length > 0) {
            formData[answer.field.name] = answer.answerFiles;
          } else if (answer.answerFile) {
            try {
              formData[answer.field.name] = JSON.parse(answer.answerFile);
            } catch {
              formData[answer.field.name] = answer.answerFile;
            }
          } else if (answer.answerText) {
            try {
              formData[answer.field.name] = JSON.parse(answer.answerText);
            } catch {
              formData[answer.field.name] = answer.answerText;
            }
          }
        }
      });
    } else {
      // Multi-applicant format
      formData = [];
      for (let i = 0; i < application.numberOfApplicants; i++) {
        const applicantData = {};
        const applicantAnswers = answers.filter(answer => answer.applicantIndex === i);
        
        applicantAnswers.forEach(answer => {
          if (answer.field && answer.field.name) {
            if (answer.answerFiles && answer.answerFiles.length > 0) {
              applicantData[answer.field.name] = answer.answerFiles;
            } else if (answer.answerFile) {
              try {
                applicantData[answer.field.name] = JSON.parse(answer.answerFile);
              } catch {
                applicantData[answer.field.name] = answer.answerFile;
              }
            } else if (answer.answerText) {
              try {
                applicantData[answer.field.name] = JSON.parse(answer.answerText);
              } catch {
                applicantData[answer.field.name] = answer.answerText;
              }
            }
          }
        });
        
        formData.push(applicantData);
      }
    }
    
    res.json({ application, formData, applicants });
  } catch (error) {
    console.error('Error fetching draft details:', error);
    res.status(500).json({ message: 'Error fetching draft details', error: error.message });
  }
});

// Update draft application (save changes without changing status)
router.put('/draft/:id', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const { formData, applicationType, numberOfApplicants, relationships } = req.body;
    
    // Get draft status
    const draftStatus = await Status.findOne({ name: 'draft' });
    console.log('Draft status:', draftStatus);
    if (!draftStatus) {
      return res.status(500).json({ message: 'Draft status not found' });
    }
    
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: draftStatus._id,
      deletedAt: null
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Update application type and number of applicants if provided
    if (applicationType) application.applicationType = applicationType;
    if (numberOfApplicants) application.numberOfApplicants = numberOfApplicants;
    await application.save();
    
    // Update applicant relationships if provided
    if (relationships && Array.isArray(relationships)) {
      const applicants = await Applicant.find({ application: application._id }).sort({ applicantIndex: 1 });
      for (let i = 0; i < Math.min(relationships.length, applicants.length); i++) {
        if (applicants[i] && relationships[i]) {
          applicants[i].relationship = relationships[i];
          await applicants[i].save();
        }
      }
    }
    
    if (formData) {
      // Get fields specific to this application's visa type form sections
      const formSections = await FormSection.find({ countryVisaType: application.countryVisaType }).lean();
      const sectionIds = formSections.map(section => section._id);
      
      const fields = await FormField.find({ formSection: { $in: sectionIds } }).lean();
      const fieldMap = fields.reduce((acc, field) => {
        acc[field.name] = field._id;
        return acc;
      }, {});
      
      // Delete existing answers
      await ApplicationAnswer.deleteMany({ application: application._id });
      
      // Save new answers
      const answers = [];
      
      if (Array.isArray(formData)) {
        // Multi-applicant format
        formData.forEach((applicantData, index) => {
          for (const [fieldName, value] of Object.entries(applicantData)) {
            if (fieldMap[fieldName] && value !== '' && value !== null && value !== undefined) {
              const field = fields.find(f => f.name === fieldName);
              const answer = {
                application: application._id,
                applicantIndex: index,
                field: fieldMap[fieldName]
              };
              
              if (field && field.type === 'file') {
                if (Array.isArray(value)) {
                  answer.answerFiles = value;
                } else if (typeof value === 'string') {
                  answer.answerFile = value;
                }
              } else {
                answer.answerText = typeof value === 'string' ? value : JSON.stringify(value);
              }
              
              answers.push(answer);
            }
          }
        });
      } else {
        // Single applicant format
        for (const [fieldName, value] of Object.entries(formData)) {
          if (fieldMap[fieldName] && value !== '' && value !== null && value !== undefined) {
            const field = fields.find(f => f.name === fieldName);
            const answer = {
              application: application._id,
              applicantIndex: 0,
              field: fieldMap[fieldName]
            };
            
            if (field && field.type === 'file') {
              if (Array.isArray(value)) {
                answer.answerFiles = value;
              } else if (typeof value === 'string') {
                answer.answerFile = value;
              }
            } else {
              answer.answerText = typeof value === 'string' ? value : JSON.stringify(value);
            }
            
            answers.push(answer);
          }
        }
      }
      
      if (answers.length > 0) {
        await ApplicationAnswer.insertMany(answers);
      }
    }
    
    res.json({ 
      success: true, 
      draftId: application._id,
      message: 'Draft updated successfully' 
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ message: 'Error updating draft', error: error.message });
  }
});

// Get single application details for customer
router.get('/application/:id', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: null
    })
    .populate('status', 'name color')
    .populate({
      path: 'countryVisaType',
      populate: [
        { path: 'country', select: 'name placeImage' },
        { path: 'visaType', select: 'name' }
      ]
    })
    .populate('user', 'name email mobile')
    .populate('assignedTo', 'name email mobile')
    .lean();
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Get applicants
    const applicants = await Applicant.find({
      application: application._id,
      deletedAt: null
    }).sort({ applicantIndex: 1 }).lean();
    
    // Get application answers with form section details
    const answers = await ApplicationAnswer.find({
      application: application._id,
      deletedAt: null
    }).populate({
      path: 'field',
      select: 'name label type order',
      populate: {
        path: 'formSection',
        select: 'name order'
      }
    }).lean();
    
    // Get application documents
    const documents = await ApplicationDocument.find({
      application: application._id
    }).lean();
    
    // Get status history
    const statusHistory = await ApplicationStatusHistory.find({
      application: application._id
    }).populate('changedBy', 'name').populate('status', 'name color').sort({ changedAt: -1 }).lean();
    
    // Get payment info
    const payment = await Payment.findOne({
      application: application._id,
      deletedAt: null
    }).lean();
    
    res.json({ application, applicants, answers, documents, statusHistory, payment });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ message: 'Error fetching application details', error: error.message });
  }
});

// Delete draft application
router.delete('/draft/:id', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const draftStatus = await Status.findOne({ name: 'draft' });
    if (!draftStatus) {
      return res.status(500).json({ message: 'Draft status not found' });
    }
    
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: draftStatus._id,
      deletedAt: null
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    application.deletedAt = new Date();
    await application.save();
    
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ message: 'Error deleting draft', error: error.message });
  }
});

// Update customer profile
router.put('/profile', auth, role(['customer', 'admin']), async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;