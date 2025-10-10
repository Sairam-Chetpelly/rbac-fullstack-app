const mongoose = require('mongoose');

const embassyReminderSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  applicationNumber: {
    type: String,
    required: true
  },
  visitDateTime: {
    type: Date,
    required: true
  },
  reminderType: {
    type: String,
    enum: ['7_days', '3_days', '2_days', '1_day', '12_hours', '6_hours', '2_hours', '1_hour', 'on_time'],
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

embassyReminderSchema.index({ scheduledFor: 1, sent: 1 });

module.exports = mongoose.model('EmbassyReminder', embassyReminderSchema);