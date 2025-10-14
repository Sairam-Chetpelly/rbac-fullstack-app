const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  emailEnabled: { type: Boolean, default: true },
  whatsappEnabled: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);