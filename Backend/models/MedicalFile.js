const mongoose = require('mongoose');

const medicalFileSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    file: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalFile', medicalFileSchema);