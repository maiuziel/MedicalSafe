const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');

const {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments,
  setAvailability,
  getDoctors
} = require('../controllers/doctorController');


// ----------------------------------------------------
// צפייה ברשימת הרופאים (מטופל או מזכירה)
// GET /api/doctor
// GET /api/doctor?specialization=cardiology
// ----------------------------------------------------

router.get(
  '/',
  authMiddleware,
  authorizeRoles('patient', 'secretary'),
  getDoctors
);


// ----------------------------------------------------
// ראוטים לרופא עצמו
// ----------------------------------------------------

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

module.exports = router;