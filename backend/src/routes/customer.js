const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Status = require('../models/Status');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { sendEmail } = require('../services/emailService');

// Get customer dashboard stats
router.get('/dashboard-stats', auth, role(['customer']), async (req, res) => {
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

// Get customer applications
router.get('/applications', auth, role(['customer']), async (req, res) => {
  try {
    const applications = await Application.find({ 
      user: req.user._id, 
      deletedAt: null 
    })
    .populate('status', 'name color')
    .populate({
      path: 'countryVisaType',
      populate: [
        { path: 'country', select: 'name flagEmoji' },
        { path: 'visaType', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    res.json(applications);
  } catch (error) {
    console.error('Error fetching customer applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get customer payments
router.get('/payments', auth, role(['customer']), async (req, res) => {
  try {
    const payments = await Payment.find({ 
      user: req.user._id, 
      deletedAt: null 
    })
    .populate('application', 'applicationNumber')
    .sort({ createdAt: -1 })
    .lean();

    res.json(payments);
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Get draft application details with form data
router.get('/draft/:id', auth, role(['customer']), async (req, res) => {
  try {
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const FormField = require('../models/FormField');
    const Applicant = require('../models/Applicant');
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
        { path: 'country', select: 'name flagEmoji' },
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
          if (answer.answerFile) {
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
            if (answer.answerFile) {
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
router.put('/draft/:id', auth, role(['customer']), async (req, res) => {
  try {
    const { formData, applicationType, numberOfApplicants, relationships } = req.body;
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const FormField = require('../models/FormField');
    const Applicant = require('../models/Applicant');
    const Status = require('../models/Status');
    
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
      const fields = await FormField.find().lean();
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
              
              if (field && field.type === 'file' && typeof value === 'string') {
                answer.answerFile = value;
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
            
            if (field && field.type === 'file' && typeof value === 'string') {
              answer.answerFile = value;
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
router.get('/application/:id', auth, role(['customer']), async (req, res) => {
  try {
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
    const Applicant = require('../models/Applicant');
    
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: null
    })
    .populate('status', 'name color')
    .populate({
      path: 'countryVisaType',
      populate: [
        { path: 'country', select: 'name flagEmoji' },
        { path: 'visaType', select: 'name' }
      ]
    })
    .populate('user', 'name email');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Get applicants
    const applicants = await Applicant.find({
      application: application._id,
      deletedAt: null
    }).sort({ applicantIndex: 1 });
    
    // Get form answers
    const answers = await ApplicationAnswer.find({
      application: application._id,
      deletedAt: null
    }).populate('field', 'name label type');
    
    // Get status history
    const statusHistory = await ApplicationStatusHistory.find({
      application: application._id
    }).populate('changedBy', 'name').populate('status', 'name color').sort({ createdAt: -1 });
    
    // Get payment info
    const payment = await Payment.findOne({
      application: application._id,
      deletedAt: null
    });
    
    res.json({ application, applicants, answers, statusHistory, payment });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ message: 'Error fetching application details', error: error.message });
  }
});

// Update customer profile
router.put('/profile', auth, role(['customer']), async (req, res) => {
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