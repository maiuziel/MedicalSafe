console.log("🔥 requestRoutes LOADED");
const express = require("express");
const router = express.Router();
router.use((req, res, next) => {
  console.log("👉 REQUEST HIT:", req.method, req.originalUrl);
  next();
});
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createRequest,
  getPatientRequests,
  getPatientRequestById,
  replyToRequest,
  updateRequestStatus
} = require("../controllers/requestController");

// ----------------------------------------------------
// 🔥 מטופל - יצירת פנייה
// ----------------------------------------------------
router.post(
  "/patient/requests",
  authenticate,
  authorizeRoles("patient"),
  createRequest
);

// ----------------------------------------------------
// 🔥 מטופל - כל הפניות
// ----------------------------------------------------
router.get(
  "/patient/requests",
  authenticate,
  authorizeRoles("patient"),
  getPatientRequests
);

// ----------------------------------------------------
// 🔥 מטופל - פנייה לפי ID
// ----------------------------------------------------
router.get(
  "/patient/requests/:requestId",
  authenticate,
  authorizeRoles("patient"),
  getPatientRequestById
);

// ----------------------------------------------------
// 🔥 רופא - תגובה לפנייה
// ----------------------------------------------------
router.post(
  "/requests/:requestId/reply",
  authenticate,
  authorizeRoles("doctor"),
  replyToRequest
);

// ----------------------------------------------------
// 🔥 רופא - עדכון סטטוס
// ----------------------------------------------------
router.put(
  "/requests/:requestId/status",
  authenticate,
  authorizeRoles("doctor"),
  updateRequestStatus
);

module.exports = router;