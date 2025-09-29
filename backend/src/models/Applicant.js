const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  applicantIndex: {
    type: Number,
    required: true,
    min: 0
  },
  relationship: {
    type: String,
    enum: ['self', 'spouse', 'child', 'parent', 'sibling', 'other'],
    default: 'self'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure unique applicant index per application
applicantSchema.index({ application: 1, applicantIndex: 1 }, { unique: true });

module.exports = mongoose.model('Applicant', applicantSchema);