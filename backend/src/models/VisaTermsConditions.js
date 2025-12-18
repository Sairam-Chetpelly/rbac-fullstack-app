const mongoose = require('mongoose');

const visaTermsConditionsSchema = new mongoose.Schema({
  countryVisaType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CountryVisaType',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VisaTermsConditions', visaTermsConditionsSchema);