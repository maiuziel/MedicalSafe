const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');

// GET /api/doctor/me
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const doctor = await User.findById(userId).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(doctor);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// PUT /api/doctor/me
const updateMyProfile = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { fullName, phone, email, specialization } = req.body;

    const updatedDoctor = await User.findByIdAndUpdate(
      userId,
      { fullName, phone, email, specialization },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedDoctor);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/doctor/appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, sortBy } = req.query;

    let filter = {
      doctor: req.user.userId
    };

    // 🔹 סינון לפי סטטוס
    if (status) {
      filter.status = status;
    }

    let query = Appointment.find(filter)
      .populate('patient', 'email fullName');

    // 🔹 מיון
    if (sortBy === 'date') {
      query = query.sort({ date: 1 }); // מהקרוב לרחוק
    }

    if (sortBy === 'dateDesc') {
      query = query.sort({ date: -1 });
    }

    if (sortBy === 'patient') {
      query = query.sort({ 'patient.fullName': 1 });
    }

    const appointments = await query;

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/doctor
const getDoctors = async (req, res) => {
  try {

    const { specialization } = req.query;

    const filter = specialization
      ? { role: 'doctor', specialization }
      : { role: 'doctor' };

    const doctors = await User.find(filter).select('-password');

    res.json(doctors);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const setAvailability = async (req, res) => {
  try {

    const { availability } = req.body;

    const doctor = await User.findByIdAndUpdate(
      req.user.userId,
      { availability },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Availability updated successfully',
      availability: doctor.availability
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadMedicalFile = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: req.file.filename,
      patientId
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorFeedbacks = async (req, res) => {
  try {
    const doctorId = req.user.userId;

    const { startDate, endDate, patientId } = req.query;

    let filter = { doctor: doctorId };

    if (patientId) {
      filter.patient = patientId;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const feedbacks = await Feedback.find(filter)
      .populate('patient', 'email')
      .populate('appointment')
      .sort({ createdAt: -1 });

    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    res.json({
      total: feedbacks.length,
      averageRating: avgRating,
      feedbacks
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const markPatientForFollowUp = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { isUnderFollowUp: true },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient marked for follow-up',
      patient
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const unmarkPatientFromFollowUp = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { isUnderFollowUp: false },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient removed from follow-up',
      patient
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getFollowUpPatients = async (req, res) => {
  try {
    const patients = await User.find({
      role: 'patient',
      isUnderFollowUp: true
    }).select('-password');

    res.json(patients);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments,
  getDoctors,
  setAvailability,
  uploadMedicalFile,
  getDoctorFeedbacks,
  markPatientForFollowUp,
  unmarkPatientFromFollowUp,
  getFollowUpPatients
};