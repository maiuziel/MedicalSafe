const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

//  doctor controller
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
  getAvailableDoctors,
  getSpecializations,
  searchPatients,
  updateAppointmentStatus,
  getPatientFiles,
  sendAppointmentRequestToSecretary,
} = require('../controllers/doctorController');

//  request controller (פניות)
const {
  getDoctorRequests,
  getDoctorRequestById,
  replyToRequest,
  updateRequestStatus
} = require('../controllers/requestController');

// ----------------------------------------------------
// חיפוש רופאים זמינים (למטופל)
// ----------------------------------------------------
router.get(
  '/availability',
  authenticate,
  authorizeRoles('patient'),
  getAvailableDoctors
);

// ----------------------------------------------------
// התמחויות
// ----------------------------------------------------
router.get(
  '/specializations',
  authenticate,
  authorizeRoles('patient', 'doctor'),
  getSpecializations
);

// ----------------------------------------------------
// רשימת רופאים
// ----------------------------------------------------
router.get(
  '/',
  authenticate,
  authorizeRoles('patient', 'doctor', 'secretary'),
  getDoctors
);

// ----------------------------------------------------
// פרופיל רופא
// ----------------------------------------------------
router.get(
  '/me',
  authenticate,
  authorizeRoles('doctor'),
  getMyProfile
);

router.put(
  '/me',
  authenticate,
  authorizeRoles('doctor'),
  updateMyProfile
);

// ----------------------------------------------------
// תורים
// ----------------------------------------------------
router.get(
  '/appointments',
  authenticate,
  authorizeRoles('doctor'),
  getDoctorAppointments
);

// ----------------------------------------------------
// זמינות
// ----------------------------------------------------
router.put(
  '/availability',
  authenticate,
  authorizeRoles('doctor'),
  setAvailability
);

// ----------------------------------------------------
// העלאת קובץ למטופל
// ----------------------------------------------------
router.post(
  '/patient/:patientId/files',
  authenticate,
  authorizeRoles('doctor'),
  upload.single('file'),
  uploadMedicalFile
);

// ----------------------------------------------------
// משובים
// ----------------------------------------------------
router.get(
  '/feedbacks',
  authenticate,
  authorizeRoles('doctor'),
  getDoctorFeedbacks
);

// ----------------------------------------------------
// מטופלים במעקב
// ----------------------------------------------------
router.put(
  '/patients/:patientId/follow',
  authenticate,
  authorizeRoles('doctor'),
  markPatientForFollowUp
);

router.put(
  '/patients/:patientId/unfollow',
  authenticate,
  authorizeRoles('doctor'),
  unmarkPatientFromFollowUp
);

router.get(
  '/patients/follow',
  authenticate,
  authorizeRoles('doctor'),
  getFollowUpPatients
);

// ----------------------------------------------------
//  פניות
// ----------------------------------------------------
router.get(
  '/requests',
  authenticate,
  authorizeRoles('doctor'),
  getDoctorRequests
);

router.get(
  '/requests/:requestId',
  authenticate,
  authorizeRoles('doctor'),
  getDoctorRequestById
);
router.get(
  "/patients/search",
  authenticate,
  authorizeRoles("doctor"),
  searchPatients
);

router.put(
  "/appointments/:id/status",
  authenticate,
  authorizeRoles("doctor"),
  updateAppointmentStatus
);
router.get(
  "/patient/:patientId/files",
  authenticate,
  authorizeRoles("doctor"),
  getPatientFiles
);
router.post(
  "/appointments/request-change",
  authenticate,
  authorizeRoles("doctor"),
  sendAppointmentRequestToSecretary
);
module.exports = router;
