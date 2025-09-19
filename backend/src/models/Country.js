const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  flagEmoji: {
    type: String,
    default: null
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: true
  },
  continent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Continent',
    required: true
  },
  processingTimeMin: {
    type: String,
    required: true
  },
  processingTimeMax: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Country', countrySchema);