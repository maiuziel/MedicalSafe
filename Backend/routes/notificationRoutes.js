const express = require("express");
const router = express.Router();

const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

// רופא, מטופל וגם מזכירה
router.get(
  "/",
  authenticate,
  authorizeRoles("doctor", "patient", "secretary"),
  getMyNotifications
);

router.put(
  "/:id/read",
  authenticate,
  authorizeRoles("doctor", "patient", "secretary"),
  markAsRead
);

module.exports = router;