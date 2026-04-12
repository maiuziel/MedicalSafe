const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { createFeedback, getDoctorFeedbacks } = require('../controllers/feedbackController');

router.post(
  '/:appointmentId',
  authenticate,
  authorizeRoles('patient'),
  createFeedback
);

router.get(
  '/doctor',
  authenticate,
  authorizeRoles('doctor'),
  getDoctorFeedbacks
);

module.exports = router;