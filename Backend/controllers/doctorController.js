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
    const { fullName, phone, email } = req.body;

    const updatedDoctor = await User.findByIdAndUpdate(
      userId,
      { fullName, phone, email },
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

module.exports = {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments
};