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

    if (fullName && !/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(fullName)) {
      return res.status(400).json({ message: 'Full name must be in format: Firstname Lastname' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (phone && !/^05\d{8}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be a valid Israeli number (05XXXXXXXX)' });
    }

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

const getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select(
      "fullName email idNumber phone"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getMyProfile,
  updateMyProfile,
  createFeedback,
  getPatientById
};