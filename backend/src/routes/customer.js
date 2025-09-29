const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get customer dashboard stats
router.get('/dashboard-stats', auth, role(['customer']), async (req, res) => {
  try {
    const userId = req.user._id;
    
    const applications = await Application.find({ user: userId, deletedAt: null });
    const payments = await Payment.find({ user: userId, deletedAt: null });
    
    const stats = {
      total_applications: applications.length,
      approved: applications.filter(app => app.status === 'approved').length,
      under_review: applications.filter(app => app.status === 'under_review').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      draft: applications.filter(app => app.status === 'draft').length,
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
    
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'draft',
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
    
    // Convert answers to form data object
    const formData = {};
    answers.forEach(answer => {
      if (answer.field && answer.field.name) {
        if (answer.answerFile) {
          formData[answer.field.name] = answer.answerFile;
        } else if (answer.answerText) {
          try {
            formData[answer.field.name] = JSON.parse(answer.answerText);
          } catch {
            formData[answer.field.name] = answer.answerText;
          }
        }
      }
    });
    
    res.json({ application, formData });
  } catch (error) {
    console.error('Error fetching draft details:', error);
    res.status(500).json({ message: 'Error fetching draft details', error: error.message });
  }
});

// Update draft application (save changes without changing status)
router.put('/draft/:id', auth, role(['customer']), async (req, res) => {
  try {
    const { formData } = req.body;
    const ApplicationAnswer = require('../models/ApplicationAnswer');
    const FormField = require('../models/FormField');
    
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'draft',
      deletedAt: null
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Draft not found' });
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
    
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: null
    })
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
    
    // Get form answers
    const answers = await ApplicationAnswer.find({
      application: application._id,
      deletedAt: null
    }).populate('field', 'name label type');
    
    // Get status history
    const statusHistory = await ApplicationStatusHistory.find({
      application: application._id
    }).populate('changedBy', 'name').sort({ createdAt: -1 });
    
    // Get payment info
    const payment = await Payment.findOne({
      application: application._id,
      deletedAt: null
    });
    
    res.json({ application, answers, statusHistory, payment });
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