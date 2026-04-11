const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); 

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
  updateRequestStatus,
  getDoctorRequests,
  getDoctorRequestById
} = require("../controllers/requestController");

// ----------------------------------------------------
// 🔥 מטופל - יצירת פנייה
// ----------------------------------------------------
router.post(
  "/patient/requests",
  authenticate,
  authorizeRoles("patient", "doctor"),
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
  upload.single("file"), // 🔥 זה הקסם
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
// 🔥 רופא - כל הפניות
router.get(
  "/doctor/requests",
  authenticate,
  authorizeRoles("doctor"),
  getDoctorRequests
);

// 🔥 רופא - פנייה לפי ID
router.get(
  "/doctor/requests/:requestId",
  authenticate,
  authorizeRoles("doctor"),
  getDoctorRequestById
);

module.exports = router;
