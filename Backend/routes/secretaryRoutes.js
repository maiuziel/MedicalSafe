const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');

const {
  getMyProfile,
  updateMyProfile,
  getDoctors,
  getPatients,
} = require('../controllers/secretaryController');

// כל הראוטים דורשים:
// ✔️ התחברות
// ✔️ role = secretary
console.log({
  authMiddleware,
  authorizeRoles,
  getMyProfile,
  updateMyProfile,
  getDoctors,
  getPatients,
});

router.get(
  '/me',
  authMiddleware,
  authorizeRoles('secretary'),
  getMyProfile
);

router.put(
  '/me',
  authMiddleware,
  authorizeRoles('secretary'),
  updateMyProfile
);

router.get(
  '/doctors',
  authMiddleware,
  authorizeRoles('secretary'),
  getDoctors
);

router.get(
  '/patients',
  authMiddleware,
  authorizeRoles('secretary'),
  getPatients
);

module.exports = router;