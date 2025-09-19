const mongoose = require('mongoose');

const countryTermsConditionsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CountryTermsConditions', countryTermsConditionsSchema);