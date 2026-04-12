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

  // 🔥 חשוב מאוד
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },

  // 🔥 חשוב מאוד
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

  // 🔥 חשוב מאוד
  recommendations: {
    type: String,
    required: true
  },

  notes: {
    type: String,
    default: ""
  },

  // 🔥 גרסאות
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