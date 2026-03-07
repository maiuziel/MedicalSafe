const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
{
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['patient', 'doctor', 'secretary', 'admin'],
    default: 'patient',
  },

  fullName: {
    type: String
  },

  phone: {
    type: String
  },

  specialization: {
    type: String
  },

  // זמינות הרופא לקבלת מטופלים
  availability: [
    {
      day: {
        type: String
      },
      startTime: {
        type: String
      },
      endTime: {
        type: String
      }
    }
  ]

},
{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);