const mongoose = require('mongoose');

const continentSchema = new mongoose.Schema({
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
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Continent', continentSchema);