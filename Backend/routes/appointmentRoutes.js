const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
} = require('../controllers/appointmentController');

// קביעת תור
router.post(
  '/',
  authMiddleware,
  authorize('patient'),
  createAppointment
);

// צפייה בתורים שלי
router.get(
  '/my',
  authMiddleware,
  authorize('patient'),
  getMyAppointments
);

// ביטול תור
router.put(
  '/cancel/:id',
  authMiddleware,
  authorize('patient'),
  cancelAppointment
);

module.exports = router;