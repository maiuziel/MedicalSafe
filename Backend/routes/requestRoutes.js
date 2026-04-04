const express = require("express");
const router = express.Router();

// ✅ תיקון import
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createRequest,
  getPatientRequests,
  getPatientRequestById
} = require("../controllers/requestController");

// 🔥 יצירת פנייה
router.post(
  "/patient/requests",
  authenticate,
  authorizeRoles("patient"),
  createRequest
);

// 🔥 כל הפניות של המטופל
router.get(
  "/patient/requests",
  authenticate,
  authorizeRoles("patient"),
  getPatientRequests
);

// 🔥 פנייה לפי ID
router.get(
  "/patient/requests/:requestId",
  authenticate,
  authorizeRoles("patient"),
  getPatientRequestById
);

module.exports = router;