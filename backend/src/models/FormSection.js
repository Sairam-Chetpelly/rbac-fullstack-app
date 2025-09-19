const mongoose = require('mongoose');

const formSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  countryVisaType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CountryVisaType',
    required: true
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FormSection', formSectionSchema);