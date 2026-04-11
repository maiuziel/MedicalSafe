const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
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
    requesterRole: {
      type: String,
      enum: ['patient', 'doctor'],
      default: 'patient'
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    serviceType: {
      type: String,
      enum: ['prescription_renewal', 'medical_question', 'administrative_request', 'other'],
      required: true
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'needs_further_review'],
      default: 'new'
    },
    reply: {
      type: String,
      default: ''
    },
    replyFile: {
      type: String,
      default: ''
    },
    repliedAt: {
      type: Date,
      default: null
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['new', 'in_progress', 'resolved', 'needs_further_review']
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reason: {
          type: String,
          default: ''
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
