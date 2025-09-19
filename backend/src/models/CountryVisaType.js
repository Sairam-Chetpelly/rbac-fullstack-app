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
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: true
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
  vfsAmount: {
    type: String,
    required: true
  },
  consulateAmount: {
    type: String,
    required: true
  },
  serviceAmount: {
    type: String,
    required: true
  },
  totalAmount: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CountryVisaType', countryVisaTypeSchema);