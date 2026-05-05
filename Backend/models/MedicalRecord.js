const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
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

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },

  visitDate: {
    type: Date,
    required: true
  },

  diagnosis: {
    type: String,
    required: true
  },

  treatment: {
    type: String,
    required: true
  },

  recommendations: {
    type: String,
    required: true
  },

  notes: {
    type: String,
    default: ""
  },

  versions: [
    {
      diagnosis: String,
      treatment: String,
      recommendations: String,
      notes: String,
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

},
{ timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);