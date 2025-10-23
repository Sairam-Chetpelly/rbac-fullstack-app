const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null,
    sparse: true
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  razorpayOrderId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  remarks: {
    type: String
  },
  paidAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Remove unique constraint to allow multiple null transactionIds
// paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });



module.exports = mongoose.model('Payment', paymentSchema);