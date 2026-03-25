const Message = require('../models/Message');
const User = require('../models/User');

// שליחת הודעה לרופא
exports.sendMessageToDoctor = async (req, res) => {
  try {
    const { doctorId, subject, content, template } = req.body;

    // בדיקה שהרופא קיים
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const message = await Message.create({
      sender: req.user.userId,
      receiver: doctorId,
      subject,
      content,
      template
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// רופא רואה הודעות
exports.getDoctorMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.userId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// סימון כהודעה נקראה
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ message: 'Message marked as read' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// מזכירה רואה היסטוריה
exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.userId })
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};