const express = require('express');
const router = express.Router();

const {
  sendMessageToDoctor,
  getDoctorMessages,
  markAsRead,
  getSentMessages
} = require('../controllers/messageController');

// ✅ תיקון import
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.post(
  '/',
  authenticate,
  authorizeRoles('secretary'),
  sendMessageToDoctor
);

router.get(
  '/doctor',
  authenticate,
  authorizeRoles('doctor'),
  getDoctorMessages
);

router.patch(
  '/:id/read',
  authenticate,
  authorizeRoles('doctor'),
  markAsRead
);

router.get(
  '/sent',
  authenticate,
  authorizeRoles('secretary'),
  getSentMessages
);

module.exports = router;