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

  specialization: {
    type: String,
    required: function () {
      return this.role === "doctor";
    }
  },

  availability: [
    {
      day: {
        type: String,
        required: true
      },
      slots: {
        type: [String],
        default: []   // 🔥 זה החלק הקריטי
      }
    }
  ]
},
{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);