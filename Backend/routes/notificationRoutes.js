const express = require("express");
const router = express.Router();

const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

// 🔥 גם רופא וגם מטופל
router.get("/", authenticate, authorizeRoles("doctor", "patient"), getMyNotifications);

router.put("/:id/read", authenticate, authorizeRoles("doctor", "patient"), markAsRead);

module.exports = router;