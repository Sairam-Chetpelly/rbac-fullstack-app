const mongoose = require('mongoose');

const fieldLibrarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'select', 'checkbox', 'radio', 'file', 'date'],
    required: true
  },
  placeholder: {
    type: String,
    trim: true
  },
  defaultValue: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String,
    trim: true
  }],
  validationRules: {
    minLength: { type: Number },
    maxLength: { type: Number },
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String },
    customMessage: { type: String }
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FieldLibrary', fieldLibrarySchema);