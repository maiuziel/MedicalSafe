const express = require('express');
const router = express.Router();

// ✅ תיקון import
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const {
  getMyProfile,
  updateMyProfile,
  getDoctors,
  getPatients,
  getAllAppointments,
  updateAppointment,
  getDoctorsAvailability
} = require('../controllers/secretaryController');


console.log({
  authenticate,
  authorizeRoles,
  getMyProfile,
  updateMyProfile,
  getDoctors,
  getPatients,
});

router.get(
  '/me',
  authenticate,
  authorizeRoles('secretary'),
  getMyProfile
);

router.put(
  '/me',
  authenticate,
  authorizeRoles('secretary'),
  updateMyProfile
);

router.get(
  '/doctors',
  authenticate,
  authorizeRoles('secretary'),
  getDoctors
);

router.get(
  '/patients',
  authenticate,
  authorizeRoles('secretary'),
  getPatients
);

router.get(
  '/appointments',
  authenticate,
  authorizeRoles('secretary'),
  getAllAppointments
);

router.put(
  '/appointments/:id',
  authenticate,
  authorizeRoles('secretary'),
  updateAppointment
);

router.get(
  '/doctors/availability',
  authenticate,
  authorizeRoles('secretary'),
  getDoctorsAvailability
);

module.exports = router;