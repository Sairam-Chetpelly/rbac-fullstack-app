const mongoose = require('mongoose');

const applicationAnswerSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormField',
    required: true
  },
  answerText: {
    type: String,
    default: null
  },
  answerFile: {
    type: String,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ApplicationAnswer', applicationAnswerSchema);