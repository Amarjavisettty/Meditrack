const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false  // Doctor will be assigned when they accept the appointment
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  healthConcern: {
    type: String,
    required: [true, 'Health concern is required'],
    maxlength: [200, 'Health concern cannot exceed 200 characters'],
    trim: true
  },
  specialization: {
    type: String,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  notes: {
    doctor: {
      type: String,
      default: ''
    },
    patient: {
      type: String,
      default: ''
    }
  },
  diagnosis: {
    type: String,
    default: ''
  },
  treatment: {
    type: String,
    default: ''
  },
  prescription: {
    medicines: [{
      name: {
        type: String,
        required: true
      },
      dosage: {
        type: String,
        required: true
      },
      frequency: {
        type: String,
        required: true
      },
      duration: {
        type: String,
        default: ''
      }
    }],
    instructions: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [150, 'Feedback comment cannot exceed 150 characters'],
      trim: true
    },
    submittedAt: {
      type: Date
    },
    isSubmitted: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
