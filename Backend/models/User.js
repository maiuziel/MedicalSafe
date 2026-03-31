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
  phone: {
    type: String,
    required: true,
  },
  
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  
  isUnderFollowUp: {
    type: Boolean,
    default: false
  },

  role: {
    type: String,
    enum: ['patient', 'doctor', 'secretary', 'admin'],
    default: 'patient',
  },

  fullName: {
    type: String,
    required: true,
  },

  phone: {
    type: String
  },

  specialization: {
    type: String
  },

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