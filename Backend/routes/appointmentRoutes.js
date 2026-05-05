const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  updateAppointment,
  getAppointmentsByPatientId,
  cancelAppointmentByDoctor
} = require('../controllers/appointmentController');

// קביעת תור
router.post(
  '/',
  authenticate,
  authorizeRoles('patient'),
  createAppointment
);

// צפייה בתורים שלי
router.get(
  '/my',
  authenticate,
  authorizeRoles('patient'),
  getMyAppointments
);

// ביטול תור
router.put(
  '/cancel/:id',
  authenticate,
  authorizeRoles('patient'),
  cancelAppointment
);

// שינוי תור (מזכירה)
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('secretary'),
  updateAppointment
);
router.get("/patient/:id", authenticate, getAppointmentsByPatientId);

router.put(
  "/doctor/cancel/:id",
  authenticate,
  authorizeRoles("doctor"),
  cancelAppointmentByDoctor
);

module.exports = router;