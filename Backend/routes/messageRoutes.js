const express = require('express');
const router = express.Router();

const {
  sendMessageToDoctor,
  getDoctorMessages,
  markAsRead,
  getSentMessages
} = require('../controllers/messageController');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.post(
  '/',
  authMiddleware,
  authorize('secretary'),
  sendMessageToDoctor
);

router.get(
  '/doctor',
  authMiddleware,
  authorize('doctor'),
  getDoctorMessages
);

router.patch(
  '/:id/read',
  authMiddleware,
  authorize('doctor'),
  markAsRead
);

router.get(
  '/sent',
  authMiddleware,
  authorize('secretary'),
  getSentMessages
);

module.exports = router;