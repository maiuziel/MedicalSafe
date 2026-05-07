const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const {
  getMyProfile,
  updateMyProfile,
  getDoctors,
  getPatients,
  getAllAppointments,
  updateAppointment,
  getDoctorsAvailability,
  getDoctorFreeSlots,
  sendMessageToDoctor,
  getSentMessages,
  getPatientAppointmentHistory
} = require('../controllers/secretaryController');

router.get('/me', authenticate, authorizeRoles('secretary'), getMyProfile);

router.put('/me', authenticate, authorizeRoles('secretary'), updateMyProfile);

router.get('/doctors', authenticate, authorizeRoles('secretary'), getDoctors);

router.get('/patients', authenticate, authorizeRoles('secretary'), getPatients);

router.get('/appointments', authenticate, authorizeRoles('secretary'), getAllAppointments);

router.put('/appointments/:id', authenticate, authorizeRoles('secretary'), updateAppointment);

router.get('/doctors/availability', authenticate, authorizeRoles('secretary'), getDoctorsAvailability);

router.get(
  '/doctors/:doctorId/free-slots',
  authenticate,
  authorizeRoles('secretary'),
  getDoctorFreeSlots
);
router.post(
  '/messages',
  authenticate,
  authorizeRoles('secretary'),
  sendMessageToDoctor
);

router.get(
  '/messages/sent',
  authenticate,
  authorizeRoles('secretary'),
  getSentMessages
);
router.get(
  '/patients/:patientId/appointments',
  authenticate,
  authorizeRoles('secretary'),
  getPatientAppointmentHistory
);

module.exports = router;