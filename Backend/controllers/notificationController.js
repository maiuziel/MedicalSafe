const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.userId, 
    }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//  סימון כנקרא
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
};