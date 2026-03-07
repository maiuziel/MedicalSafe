const Appointment = require('../models/Appointment');

// קביעת תור
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    const appointment = await Appointment.create({
      patient: req.user.userId,
      doctor: doctorId,
      date,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// צפייה בתורים שלי
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.userId,
    })
      .populate('doctor', 'email fullName');

    res.json(appointments);
  } catch (error) {
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

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
};