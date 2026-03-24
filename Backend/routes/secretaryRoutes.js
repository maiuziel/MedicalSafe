const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');

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
router.get(
  '/appointments',
  authMiddleware,
  authorizeRoles('secretary'),
  getAllAppointments
);

router.put(
  '/appointments/:id',
  authMiddleware,
  authorizeRoles('secretary'),
  updateAppointment
);

router.get(
  '/doctors/availability',
  authMiddleware,
  authorizeRoles('secretary'),
  getDoctorsAvailability
);
module.exports = router;