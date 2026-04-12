const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const auditLogger = require('../utils/auditLogger');

const createFeedback = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Feedback can be left only for completed appointments' });
    }

    const existingFeedback = await Feedback.findOne({ appointment: appointmentId });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this appointment' });
    }

    const feedback = await Feedback.create({
        patient: req.user.userId,
        doctor: appointment.doctor,
        appointment: appointment._id,
        rating,
        comment
      });

    await auditLogger({
      req,
      action: 'CREATE_FEEDBACK',
      resource: 'feedback',
      resourceId: feedback._id
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ doctor: req.user.userId })
      .populate('patient', 'fullName email')
      .populate('appointment', 'date status')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createFeedback,
  getDoctorFeedbacks
};