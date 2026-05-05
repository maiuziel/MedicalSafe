const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: [
      "appointment_created",
      "appointment_cancelled",
      "appointment_updated",
      "appointment_status_updated",
      "appointment_completed",
      "appointment_rescheduled",
      "file_uploaded",
      "request_reply",
      "feedback_received",
      "doctor_message",
      "follow_up_alert",
    ],
    required: true,
  },

  message: String,

  status: {
    type: String,
    enum: ["sent", "failed"],
    default: "sent",
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
  },

  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },

  relatedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
});


module.exports = mongoose.model("Notification", notificationSchema);