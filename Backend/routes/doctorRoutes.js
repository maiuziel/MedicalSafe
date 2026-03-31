const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');
const upload = require('../middleware/upload');

// 🔹 doctor controller
const {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments,
  setAvailability,
  getDoctors,
  uploadMedicalFile,
  getDoctorFeedbacks,
  markPatientForFollowUp,
  unmarkPatientFromFollowUp,
  getFollowUpPatients,
  getAvailableDoctors ,
  getSpecializations
} = require('../controllers/doctorController');

// 🔹 request controller (פניות)
const {
  getDoctorRequests,
  getDoctorRequestById,
  replyToRequest,
  updateRequestStatus
} = require('../controllers/requestController');

// ----------------------------------------------------
// חיפוש רופאים זמינים (למטופל) - חשוב שיהיה למעלה
// ----------------------------------------------------
router.get(
  '/availability',
  authMiddleware,
  authorizeRoles('patient'),
  getAvailableDoctors
);
// ----------------------------------------------------
// 🔥 התמחויות (חשוב לפני "/")
// ----------------------------------------------------
router.get(
  "/specializations",
  authMiddleware,
  authorizeRoles("patient"),
  getSpecializations
);
// ----------------------------------------------------
// רשימת כל הרופאים (למטופל/מזכירה)
// ----------------------------------------------------
router.get(
  '/',
  authMiddleware,
  authorizeRoles('patient', 'secretary'),
  getDoctors
);

// ----------------------------------------------------
// רופא - פרופיל
// ----------------------------------------------------
router.get(
  '/me',
  authMiddleware,
  authorizeRoles('doctor'),
  getMyProfile
);

router.put(
  '/me',
  authMiddleware,
  authorizeRoles('doctor'),
  updateMyProfile
);

// ----------------------------------------------------
// רופא - תורים
// ----------------------------------------------------
router.get(
  '/appointments',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorAppointments
);

// ----------------------------------------------------
// זמינות רופא (עדכון על ידי הרופא)
// ----------------------------------------------------
router.put(
  '/availability',
  authMiddleware,
  authorizeRoles('doctor'),
  setAvailability
);

// ----------------------------------------------------
// העלאת קבצים למטופל
// ----------------------------------------------------
router.post(
  '/patient/:patientId/files',
  authMiddleware,
  authorizeRoles('doctor'),
  upload.single('file'),
  uploadMedicalFile
);

// ----------------------------------------------------
// משובים
// ----------------------------------------------------
router.get(
  '/feedbacks',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorFeedbacks
);

// ----------------------------------------------------
// מטופלים במעקב
// ----------------------------------------------------
router.put(
  '/patients/:patientId/follow',
  authMiddleware,
  authorizeRoles('doctor'),
  markPatientForFollowUp
);

router.put(
  '/patients/:patientId/unfollow',
  authMiddleware,
  authorizeRoles('doctor'),
  unmarkPatientFromFollowUp
);

router.get(
  '/patients/follow',
  authMiddleware,
  authorizeRoles('doctor'),
  getFollowUpPatients
);

// ----------------------------------------------------
// פניות (Requests)
// ----------------------------------------------------

router.get(
  '/requests',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorRequests
);

router.get(
  '/requests/:requestId',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorRequestById
);

router.put(
  '/requests/:requestId/reply',
  authMiddleware,
  authorizeRoles('doctor'),
  upload.single('file'),
  replyToRequest
);

router.put(
  '/requests/:requestId/status',
  authMiddleware,
  authorizeRoles('doctor'),
  updateRequestStatus
);
router.get(
  "/specializations",
  authMiddleware,
  authorizeRoles("patient"),
  getSpecializations
);
module.exports = router;