const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  countryVisaType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CountryVisaType',
    required: true
  },
  applicationNumber: {
    type: String,
    unique: true
  },
  applicationType: {
    type: String,
    enum: ['individual', 'family', 'group'],
    default: 'individual'
  },
  numberOfApplicants: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate application number before saving
applicationSchema.pre('save', function(next) {
  if (this.isNew && !this.applicationNumber) {
    this.applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);