const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: '#gray' },
  category: { 
    type: String, 
    enum: ['System', 'Application', 'Payment', 'Document', 'Processing', 'Visa', 'General'],
    default: 'General'
  },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Status', statusSchema);