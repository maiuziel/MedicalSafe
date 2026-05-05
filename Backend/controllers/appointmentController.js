const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const auditLogger = require('../utils/auditLogger');


const createAppointment = async (req, res) => {
  console.log("🔥 CREATE APPOINTMENT TRIGGERED");
  try {
    const { doctorId, date } = req.body;

    const appointment = await Appointment.create({
      patient: req.user.userId,
      doctor: doctorId,
      date,
    });

    await Notification.create({
      user: doctorId,
      type: "appointment_created",
      message: "New appointment scheduled",
    });

    await Notification.create({
      user: req.user.userId,
      type: "appointment_created",
      message: `Appointment scheduled for ${new Date(date).toLocaleString()}`,
    });

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


const getMyAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find({
      patient: req.user.userId,
      status: { $ne: 'cancelled' } 
    }).populate('doctor', 'email fullName specialization');

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
      { 
        status: 'cancelled',
        statusUpdatedAt: new Date(), 
        statusUpdatedBy: req.user.userId 
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Notification.create({
      user: appointment.doctor,
      type: "appointment_cancelled",
      message: "Appointment was cancelled by patient",
    });

    await Notification.create({
      user: appointment.patient,
      type: "appointment_cancelled",
      message: `Your appointment on ${new Date(appointment.date).toLocaleString()} was cancelled`,
    });

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


const cancelAppointmentByDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        doctor: req.user.userId,
      },
      { 
        status: 'cancelled',
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.user.userId
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Notification.create({
      user: appointment.patient,
      type: "appointment_cancelled",
      message: `Your appointment on ${new Date(appointment.date).toLocaleString()} was cancelled by the doctor`,
    });

    await auditLogger({
      req,
      action: 'CANCEL_APPOINTMENT_BY_DOCTOR',
      resource: 'appointment',
      resourceId: appointment._id
    });

    res.json({
      message: 'Appointment cancelled by doctor',
      appointment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// שינוי תאריך/שעה של תור
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

    await Notification.create({
      user: appointment.doctor,
      type: "appointment_updated",
      message: "Appointment time updated",
    });

    await Notification.create({
      user: appointment.patient,
      type: "appointment_updated",
      message: `Your appointment was updated to ${new Date(date).toLocaleString()}`,
    });

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


const getAppointmentsByPatientId = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.id,
    });

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  updateAppointment,
  getAppointmentsByPatientId,
  cancelAppointmentByDoctor
};