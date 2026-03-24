const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');
const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');

// GET /api/patient/me
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const patient = await User.findById(userId).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Audit Log
    await auditLogger({
      req,
      action: 'VIEW_PROFILE',
      resource: 'patient_profile',
      resourceId: userId
    });

    res.json(patient);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// PUT /api/patient/me
const updateMyProfile = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { fullName, phone, email } = req.body;

    const updatedPatient = await User.findByIdAndUpdate(
      userId,
      { fullName, phone, email },
      { new: true, runValidators: true }
    ).select('-password');

    //Audit Log
    await auditLogger({
      req,
      action: 'UPDATE_PROFILE',
      resource: 'patient_profile',
      resourceId: userId
    });

    res.json(updatedPatient);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment || appointment.patient.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const feedback = await Feedback.create({
      patient: req.user.userId,
      doctor: appointment.doctor,
      appointment: appointmentId,
      rating,
      comment
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  createFeedback
};