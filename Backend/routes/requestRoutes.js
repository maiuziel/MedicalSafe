const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roles");

const {
  createRequest,
  getPatientRequests,
  getPatientRequestById
} = require("../controllers/requestController");

// 🔥 יצירת פנייה
router.post(
  "/patient/requests",
  authMiddleware,
  authorizeRoles("patient"),
  createRequest
);

// 🔥 כל הפניות של המטופל
router.get(
  "/patient/requests",
  authMiddleware,
  authorizeRoles("patient"),
  getPatientRequests
);

// 🔥 פנייה לפי ID
router.get(
  "/patient/requests/:requestId",
  authMiddleware,
  authorizeRoles("patient"),
  getPatientRequestById
);

module.exports = router;