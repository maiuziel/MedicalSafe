const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification'); // 🔥 NEW
const auditLogger = require('../utils/auditLogger');


// קביעת תור
const createAppointment = async (req, res) => {
  console.log("🔥 CREATE APPOINTMENT TRIGGERED");
  try {
    const { doctorId, date } = req.body;

    const appointment = await Appointment.create({
      patient: req.user.userId,
      doctor: doctorId,
      date,
    });

    // 🔔 יצירת התראה לרופא
    await Notification.create({
      doctor: doctorId,
      type: "appointment_created",
      message: "New appointment scheduled",
    });

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'CREATE_APPOINTMENT',
      resource: 'appointment',
      resourceId: appointment._id
    });

    res.status(201).json(appointment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// צפייה בתורים שלי
const getMyAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find({
      patient: req.user.userId,
    }).populate('doctor', 'email fullName');

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'VIEW_MY_APPOINTMENTS',
      resource: 'appointment'
    });

    res.json(appointments);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ביטול תור
const cancelAppointment = async (req, res) => {
  try {

    const { id } = req.params;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        patient: req.user.userId,
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 🔔 התראה לרופא על ביטול
    await Notification.create({
      doctor: appointment.doctor,
      type: "appointment_cancelled",
      message: "Appointment was cancelled",
    });

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'CANCEL_APPOINTMENT',
      resource: 'appointment',
      resourceId: appointment._id
    });

    res.json(appointment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// שינוי תאריך/שעה של תור (מזכירה)
const updateAppointment = async (req, res) => {
  try {

    const { id } = req.params;
    const { date } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.date = date;
    await appointment.save();

    // 🔔 התראה לרופא על שינוי
    await Notification.create({
      doctor: appointment.doctor,
      type: "appointment_updated",
      message: "Appointment time updated",
    });

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'UPDATE_APPOINTMENT',
      resource: 'appointment',
      resourceId: appointment._id
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  updateAppointment,
};