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
    const userId = req.user.id;
    
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