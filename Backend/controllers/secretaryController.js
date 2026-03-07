const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auditLogger = require('../utils/auditLogger');

/**
 * GET /api/secretary/me
 * צפייה בפרופיל המזכירה
 */
const getMyProfile = async (req, res) => {
  try {
    const secretary = await User.findById(req.user.userId).select('-password');

    if (!secretary) {
      return res.status(404).json({ message: 'Secretary not found' });
    }

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'VIEW_PROFILE',
      resource: 'secretary_profile',
      resourceId: req.user.userId
    });

    res.json(secretary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * PUT /api/secretary/me
 * עדכון פרטים אישיים של המזכירה
 */
const updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;

    const updatedSecretary = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, phone, email },
      { new: true, runValidators: true }
    ).select('-password');

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'UPDATE_PROFILE',
      resource: 'secretary_profile',
      resourceId: req.user.userId
    });

    res.json(updatedSecretary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * GET /api/secretary/doctors
 * צפייה בכל הרופאים
 */
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'VIEW_DOCTORS',
      resource: 'user'
    });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * GET /api/secretary/patients
 * חיפוש / צפייה במטופלים
 */
const getPatients = async (req, res) => {
  try {
    const { q } = req.query;

    const filter = q
      ? {
          role: 'patient',
          $or: [
            { fullName: { $regex: q, $options: 'i' } },
            { idNumber: q },
          ],
        }
      : { role: 'patient' };

    const patients = await User.find(filter).select('-password');

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'VIEW_PATIENTS',
      resource: 'user'
    });

    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * GET /api/secretary/appointments
 * צפייה בכל התורים במערכת
 */
const getAllAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find()
      .populate('doctor', 'fullName email')
      .populate('patient', 'fullName email');

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'VIEW_ALL_APPOINTMENTS',
      resource: 'appointment'
    });

    res.json(appointments);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getMyProfile,
  updateMyProfile,
  getDoctors,
  getPatients,
  getAllAppointments,
};