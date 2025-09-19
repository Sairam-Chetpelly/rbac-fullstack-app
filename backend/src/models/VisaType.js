const mongoose = require('mongoose');

const visaTypeSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VisaType', visaTypeSchema);