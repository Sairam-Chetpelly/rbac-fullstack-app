const mongoose = require('mongoose');

const countryVisaTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  visaType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisaType',
    required: true
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  processingTimeMin: {
    type: String,
    required: true
  },
  processingTimeMax: {
    type: String,
    required: true
  },
  totalAmount: {
    type: String,
    required: true
  },
  agentDiscount: {
    type: String,
    default: '0'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CountryVisaType', countryVisaTypeSchema);