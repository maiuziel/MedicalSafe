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

  // תחום התמחות של רופא
  specialization: {
    type: String,
    required: function () {
      return this.role === 'doctor';
    },
    trim: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);