const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: '#gray' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Status', statusSchema);