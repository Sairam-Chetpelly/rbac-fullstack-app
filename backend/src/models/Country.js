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
  placeImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Country', countrySchema);