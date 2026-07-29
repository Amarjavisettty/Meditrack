const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Feedback comment is required'],
    trim: true,
    maxlength: 500
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  doctorReply: {
    type: String,
    trim: true,
    maxlength: 500
  },
  replyDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ doctor: 1, rating: -1 });
feedbackSchema.index({ patient: 1, createdAt: -1 });
feedbackSchema.index({ appointment: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
