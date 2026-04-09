const express = require("express");
const router = express.Router();

const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

router.get("/", authenticate, authorizeRoles("doctor"), getMyNotifications);

router.put("/:id/read", authenticate, authorizeRoles("doctor"), markAsRead);

module.exports = router;