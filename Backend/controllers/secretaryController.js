const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auditLogger = require('../utils/auditLogger');

/**
 * GET /api/secretary/me
 */
const getMyProfile = async (req, res) => {
  try {
    const secretary = await User.findById(req.user.userId).select('-password');

    if (!secretary) {
      return res.status(404).json({ message: 'Secretary not found' });
    }

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
 */
const updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;

    const updatedSecretary = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, phone, email },
      { new: true, runValidators: true }
    ).select('-password');

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
 */
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');

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
 */
const getAllAppointments = async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;

    let filter = {};

    if (doctorId) {
      filter.doctor = doctorId;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'fullName email')
      .populate('patient', 'fullName email')
      .sort({ date: 1 });

    if (appointments.length === 0) {
      return res.status(404).json({
        message: 'No appointments found for given filters'
      });
    }

    await auditLogger({
      req,
      action: 'VIEW_APPOINTMENTS',
      resource: 'appointment'
    });

    res.json(appointments);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * PUT /api/secretary/appointments/:id
 * עדכון תור
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    // 🔴 הרשאות
    if (req.user.role !== 'secretary') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // 🔴 ולידציה
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    if (isNaN(new Date(date))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (new Date(date) < new Date()) {
      return res.status(400).json({ message: 'Date must be in the future' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 🔴 בדיקה שלא אותו תאריך
    if (appointment.date.getTime() === new Date(date).getTime()) {
      return res.status(400).json({ message: 'Same date as current' });
    }

    // 🔴 בדיקת זמינות
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date: new Date(date),
      _id: { $ne: id }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'Doctor is not available at this time'
      });
    }

    // 🔴 עדכון
    appointment.date = new Date(date);
    await appointment.save();

    // 🔴 populate אחרי עדכון
    const updatedAppointment = await Appointment.findById(id)
      .populate('doctor', 'fullName email')
      .populate('patient', 'fullName email');

    // 🔴 התראה למטופל (מינימום)
    console.log(`Notification sent to patient ${updatedAppointment.patient._id}`);

    // 🔴 Audit
    await auditLogger({
      req,
      action: 'UPDATE_APPOINTMENT',
      resource: 'appointment',
      resourceId: id
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });

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
  updateAppointment
};