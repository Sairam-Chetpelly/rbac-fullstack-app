const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get all payments (admin only)
router.get('/', auth, role(['admin']), async (req, res) => {
  try {
    const payments = await Payment.find({ deletedAt: null })
      .populate('user', 'name email')
      .populate('application', 'applicationNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Get single payment details (admin only)
router.get('/:id', auth, role(['admin']), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate('application', 'applicationNumber status')
      .lean();

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Error fetching payment details', error: error.message });
  }
});

module.exports = router;