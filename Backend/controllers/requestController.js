const mongoose = require("mongoose");
const Request = require('../models/Request');
const Appointment = require('../models/Appointment');
const User = require('../models/User');


const createRequest = async (req, res) => {
  console.log("BODY:", req.body);
console.log("USER:", req.user);
  try {
    const { doctorId, subject, description, reason, serviceType, urgency, appointmentId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }
    if (!doctorId || !subject || !description || !reason || !serviceType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.patient.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized for this appointment' });
      }
    }

    const newRequest = await Request.create({
      patient: req.user.userId,
      doctor: doctorId,
      appointment: appointmentId || null,
      subject,
      description,
      reason,
      serviceType,
      urgency: urgency || 'medium',
      status: 'new',
      statusHistory: [
        {
          status: 'new',
          changedBy: req.user.userId,
          reason: 'Request created'
        }
      ]
    });

    res.status(201).json({
      message: 'Request submitted successfully',
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorRequests = async (req, res) => {
  try {
    const { status, urgency, serviceType, sortBy } = req.query;

    const filter = { doctor: req.user.userId };

    if (status) {
      filter.status = status;
    }

    if (urgency) {
      filter.urgency = urgency;
    }

    if (serviceType) {
      filter.serviceType = serviceType;
    }

    let query = Request.find(filter)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email specialization');

    if (sortBy === 'date') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'subject') {
      query = query.sort({ subject: 1 });
    } else if (sortBy === 'urgency') {
      query = query.sort({ urgency: 1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const requests = await query;

    res.json({
      total: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const requestItem = await Request.findOne({
      _id: requestId,
      doctor: req.user.userId
    })
      .populate('patient', 'fullName email phone')
      .populate('doctor', 'fullName email specialization')
      .populate('appointment');

    if (!requestItem) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const patientAppointments = await Appointment.find({
      patient: requestItem.patient._id
    }).sort({ date: -1 });

    res.json({
      request: requestItem,
      patientHistory: patientAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const replyToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ message: 'Reply is required' });
    }

    const requestItem = await Request.findOne({
      _id: requestId,
      doctor: req.user.userId
    });

    if (!requestItem) {
      return res.status(404).json({ message: 'Request not found' });
    }

    requestItem.reply = reply.trim();
    requestItem.repliedAt = new Date();
    requestItem.repliedBy = req.user.userId;
    requestItem.status = "resolved"; // 🔥 מוסיף אוטומטית סיום

    if (req.file) {
      requestItem.replyFile = req.file.filename;
    }

    await requestItem.save();

    res.json({
      message: 'Reply sent successfully',
      request: requestItem
    });

  } catch (error) {
    console.error("❌ ERROR IN replyToRequest:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reason } = req.body;

    const allowedStatuses = ['new', 'in_progress', 'resolved', 'needs_further_review'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const requestItem = await Request.findOne({
      _id: requestId,
      doctor: req.user.userId
    });

    if (!requestItem) {
      return res.status(404).json({ message: 'Request not found' });
    }

    requestItem.status = status;
    requestItem.statusHistory.push({
      status,
      changedBy: req.user.userId,
      reason: reason || ''
    });

    await requestItem.save();

    res.json({
      message: 'Request status updated successfully',
      request: requestItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPatientRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      patient: req.user.userId
    })
      .populate('doctor', 'fullName email specialization')
      .sort({ createdAt: -1 });

    res.json({
      total: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPatientRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const requestItem = await Request.findOne({
      _id: requestId,
      patient: req.user.userId
    })
      .populate('doctor', 'fullName email specialization')
      .populate('patient', 'fullName email');

    if (!requestItem) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(requestItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequest,
  getDoctorRequests,
  getDoctorRequestById,
  replyToRequest,
  updateRequestStatus,
  getPatientRequests,
  getPatientRequestById
};