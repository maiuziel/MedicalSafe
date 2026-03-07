const User = require('../models/User');
const Appointment = require('../models/Appointment');

// GET /api/doctor/me
// צפייה בפרטי הרופא המחובר
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
// עדכון פרטים אישיים של הרופא
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
// הרופא רואה את כל התורים שלו
const getDoctorAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find({
      doctor: req.user.userId
    }).populate('patient', 'email');

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/doctor
// צפייה ברשימת הרופאים (עם אפשרות סינון לפי תחום התמחות)
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
// הגדרת זמינות רופא
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

module.exports = {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments,
  getDoctors,
  setAvailability
};