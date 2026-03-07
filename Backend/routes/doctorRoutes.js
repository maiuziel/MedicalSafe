const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');

const {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments
} = require('../controllers/doctorController');

// כל הראוטים כאן:
// ✔️ דורשים התחברות
// ✔️ מוגבלים לרופא בלבד

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

router.get(
  '/appointments',
  authMiddleware,
  authorizeRoles('doctor'),
  getDoctorAppointments
);

module.exports = router;