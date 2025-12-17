const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  nationality: { type: String },
  role: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  isActive: { type: Boolean, default: true },
  // Agent fields
  isAgent: { type: Boolean, default: null },
  companyName: { type: String, default: null },
  companyAddress: {
    line1: { type: String, default: null },
    line2: { type: String, default: null },
    city: { type: String, default: null },
    pin: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null }
  },
  panCardNumber: { type: String, default: null },
  panCardPhoto: { type: String, default: null },
  gstNumber: { type: String, default: null },
  gstFile: { type: String, default: null },
  aadhaarNumber: { type: String, default: null },
  aadhaarFile: { type: String, default: null },
  msmeNumber: { type: String, default: null },
  msmeFile: { type: String, default: null },
  cancelledChequeFile: { type: String, default: null },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);