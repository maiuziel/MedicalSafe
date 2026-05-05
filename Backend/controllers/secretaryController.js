const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auditLogger = require('../utils/auditLogger');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
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
    const { doctorId, startDate, endDate, patientId } = req.query;

    let filter = {};

    if (doctorId) {
      filter.doctor = doctorId;
    }

    if (patientId) {
      filter.patient = patientId;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'fullName email specialization')
      .populate('patient', 'fullName email')
      .sort({ date: 1 });

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
 * עדכון תור - תאריך / שעה / רופא
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, doctorId, status } = req.body;

    if (req.user.role !== 'secretary') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!date && !doctorId && !status) {
      return res.status(400).json({
        message: 'Date, doctor or status is required'
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const newDate = date ? new Date(date) : appointment.date;
    const newDoctor = doctorId || appointment.doctor;

    if (date && isNaN(newDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (newDate < new Date()) {
      return res.status(400).json({
        message: 'Date must be in the future'
      });
    }
    const allowedStatuses = ['scheduled', 'completed', 'cancelled'];

if (status && !allowedStatuses.includes(status)) {
  return res.status(400).json({
    message: 'Invalid appointment status'
  });
}

    const doctor = await User.findById(newDoctor);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const dayName = newDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const requestedTime = newDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const dayAvailability = doctor.availability?.find((a) => {
      return a.day?.toLowerCase() === dayName;
    });

    if (!dayAvailability) {
      return res.status(400).json({
        message: 'Doctor is not working on this day'
      });
    }

    if (!dayAvailability.slots.includes(requestedTime)) {
      return res.status(400).json({
        message: 'Doctor is not available at this time'
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctor: newDoctor,
      date: newDate,
      _id: { $ne: id }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'Doctor is not available at this time'
      });
    }

    appointment.date = newDate;
    appointment.doctor = newDoctor;
    if (status) {
      appointment.status = status;
    }
    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate('doctor', 'fullName email specialization')
      .populate('patient', 'fullName email');

    console.log(
      `Notification sent to patient ${updatedAppointment.patient?._id}`
    );

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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const getDoctorsAvailability = async (req, res) => {
  try {
    const { doctorId, specialization } = req.query;

    let filter = { role: 'doctor' };

    if (doctorId) {
      filter._id = doctorId;
    }

    if (specialization) {
      filter.specialization = specialization;
    }

    const doctors = await User.find(filter).select('-password');

    const result = doctors.map((doctor) => {
      return {
        doctorId: doctor._id,
        fullName: doctor.fullName,
        specialization: doctor.specialization,
        availability: doctor.availability,

        // 🔥 התיקון החשוב
        isAvailable: doctor.availability && doctor.availability.length > 0
      };
    });

    await auditLogger({
      req,
      action: 'VIEW_DOCTORS_AVAILABILITY',
      resource: 'doctor'
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
const getDoctorFreeSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findById(doctorId).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    });

    const busySlots = appointments.map((appointment) => {
      const appointmentDate = new Date(appointment.date);

      const day = appointmentDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();

      const time = appointmentDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return `${day}-${time}`;
    });

    const freeSlots = doctor.availability.map((dayAvailability) => {
      const day = dayAvailability.day.toLowerCase();

      return {
        day,
        slots: dayAvailability.slots.filter((slot) => {
          return !busySlots.includes(`${day}-${slot}`);
        })
      };
    });

    res.json({
      doctorId: doctor._id,
      fullName: doctor.fullName,
      specialization: doctor.specialization,
      freeSlots
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const sendMessageToDoctor = async (req, res) => {
  try {
    const { doctorId, subject, content, template } = req.body;

    if (!doctorId || !subject || !content) {
      return res.status(400).json({
        message: 'Doctor, subject and content are required'
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const secretary = await User.findById(req.user.userId);

    const message = await Message.create({
      sender: req.user.userId,
      receiver: doctorId,
      subject,
      content,
      template: template || 'FREE_TEXT',
      isRead: false
    });

    await Notification.create({
      user: doctorId,
      type: 'doctor_message',
      message: `New message from ${secretary?.fullName || 'secretary'}: ${subject}`,
      relatedMessage: message._id,
      isRead: false
    });

    await auditLogger({
      req,
      action: 'SEND_MESSAGE_TO_DOCTOR',
      resource: 'message',
      resourceId: message._id
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (err) {
    console.error("ERROR in sendMessageToDoctor:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.userId })
      .populate('receiver', 'fullName email specialization')
      .sort({ createdAt: -1 });

    res.json(messages);
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
  updateAppointment,
  getDoctorsAvailability,
  getDoctorFreeSlots,
  sendMessageToDoctor,
  getSentMessages
};