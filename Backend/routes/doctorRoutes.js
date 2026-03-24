const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');
const upload = require('../middleware/upload');
const { getDoctorFeedbacks } = require('../controllers/doctorController');

const {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments,
  setAvailability,
  getDoctors,
  uploadMedicalFile
} = require('../controllers/doctorController');

router.get(
  '/',
  authMiddleware,
  authorizeRoles('patient', 'secretary'),
  getDoctors
);

// רופא רואה את הפרופיל שלו
router.get(
  '/me',
  authMiddleware,
  authorizeRoles('doctor'),
  getMyProfile
);

// רופא מעדכן את הפרופיל שלו
router.put(
  '/me',
  authMiddleware,
  authorizeRoles('doctor'),
  updateMyProfile
);

// רופא רואה את התורים שלו
router.get(
  '/appointments',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorAppointments
);
router.put(
  '/availability',
  authMiddleware,
  authorizeRoles('doctor'),
  setAvailability
);
router.post(
  '/patient/:patientId/files',
  authMiddleware,
  authorizeRoles('doctor'),
  upload.single('file'),
  uploadMedicalFile
);

router.get(
  '/feedbacks',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorFeedbacks
);

module.exports = router;