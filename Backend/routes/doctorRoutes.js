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
  getFollowUpPatients
} = require('../controllers/doctorController');

// 🔹 request controller (פניות)
const {
  getDoctorRequests,
  getDoctorRequestById,
  replyToRequest,
  updateRequestStatus
} = require('../controllers/requestController');


// ----------------------------------------------------
// רשימת רופאים (למטופל/מזכירה)
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
// זמינות רופא
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

// קבלת כל הפניות לרופא
router.get(
  '/requests',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorRequests
);

// קבלת פנייה לפי ID
router.get(
  '/requests/:requestId',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorRequestById
);

// מענה לפנייה (עם אפשרות לקובץ)
router.put(
  '/requests/:requestId/reply',
  authMiddleware,
  authorizeRoles('doctor'),
  upload.single('file'),
  replyToRequest
);

// שינוי סטטוס פנייה
router.put(
  '/requests/:requestId/status',
  authMiddleware,
  authorizeRoles('doctor'),
  updateRequestStatus
);


module.exports = router;