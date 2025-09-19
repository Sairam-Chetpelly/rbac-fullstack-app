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
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VisaTermsConditions', visaTermsConditionsSchema);