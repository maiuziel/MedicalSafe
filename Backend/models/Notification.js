const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // 👇 חדש
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
      "file_uploaded",              
      "request_reply",             
    ],
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

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Notification", notificationSchema);