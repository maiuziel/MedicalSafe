const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");

// מזכירה שולחת הודעה ראשונה לרופא
exports.sendMessageToDoctor = async (req, res) => {
  try {
    const { doctorId, subject, content, template } = req.body;

    if (!doctorId || !subject || !content) {
      return res.status(400).json({
        message: "Doctor, subject and content are required",
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const secretary = await User.findById(req.user.userId);

    const message = await Message.create({
      sender: req.user.userId,
      receiver: doctorId,
      subject,
      content,
      template: template || "FREE_TEXT",
      isRead: false,
    });

    await Notification.create({
      user: doctorId,
      type: "doctor_message",
      message: `New message from ${secretary?.fullName || "secretary"}: ${subject}`,
      relatedMessage: message._id,
      isRead: false,
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("ERROR in sendMessageToDoctor:", error);
    res.status(500).json({ message: error.message });
  }
};

// רופא רואה הודעות שקיבל
exports.getDoctorMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.userId })
      .populate("sender", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// מזכירה רואה הודעות ששלחה
exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.userId })
      .populate("receiver", "fullName email role specialization")
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// סימון הודעה אחת כנקראה
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (String(message.receiver) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// פתיחת הודעה בודדת
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "fullName email role")
      .populate("receiver", "fullName email role");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const userId = req.user.userId;

    if (
      String(message.sender._id) !== String(userId) &&
      String(message.receiver._id) !== String(userId)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (String(message.receiver._id) === String(userId)) {
      message.isRead = true;
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// שליפת כל הצ׳אט של הודעה מסוימת
exports.getConversation = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const userId = req.user.userId;

    if (
      String(message.sender) !== String(userId) &&
      String(message.receiver) !== String(userId)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const conversationId = message.conversationId || message._id;

    const messages = await Message.find({
      $or: [{ _id: conversationId }, { conversationId }],
    })
      .populate("sender", "fullName email role")
      .populate("receiver", "fullName email role")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        receiver: userId,
        $or: [{ _id: conversationId }, { conversationId }],
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("ERROR in getConversation:", error);
    res.status(500).json({ message: error.message });
  }
};

// שליחת הודעה בתוך הצ׳אט
exports.replyToMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const originalMessage = await Message.findById(req.params.id);

    if (!originalMessage) {
      return res.status(404).json({ message: "Original message not found" });
    }

    const userId = req.user.userId;

    if (
      String(originalMessage.sender) !== String(userId) &&
      String(originalMessage.receiver) !== String(userId)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const receiverId =
      String(originalMessage.sender) === String(userId)
        ? originalMessage.receiver
        : originalMessage.sender;

    const conversationId =
      originalMessage.conversationId || originalMessage._id;

    const sender = await User.findById(userId);

    const reply = await Message.create({
      sender: userId,
      receiver: receiverId,
      subject: originalMessage.subject.startsWith("Re:")
        ? originalMessage.subject
        : `Re: ${originalMessage.subject}`,
      content: content.trim(),
      template: "FREE_TEXT",
      isRead: false,
      conversationId,
    });

    await Notification.create({
      user: receiverId,
      type: "doctor_message",
      message: `New message from ${sender?.fullName || "user"}: ${reply.subject}`,
      relatedMessage: reply._id,
      isRead: false,
    });

    res.status(201).json({
      message: "Reply sent successfully",
      data: reply,
    });
  } catch (error) {
    console.error("ERROR in replyToMessage:", error);
    res.status(500).json({ message: error.message });
  }
};