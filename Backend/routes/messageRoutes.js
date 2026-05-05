const express = require('express');
const router = express.Router();

const {
  sendMessageToDoctor,
  getDoctorMessages,
  markAsRead,
  getSentMessages,
  getMessageById,
  replyToMessage,
  getConversation,
  getSecretaries,
  sendMessageToSecretary,
} = require('../controllers/messageController');

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.post(
  '/',
  authenticate,
  authorizeRoles('secretary'),
  sendMessageToDoctor
);

router.get(
  '/secretaries',
  authenticate,
  authorizeRoles('doctor'),
  getSecretaries
);

router.post(
  '/doctor-to-secretary',
  authenticate,
  authorizeRoles('doctor'),
  sendMessageToSecretary
);

router.get(
  '/doctor',
  authenticate,
  authorizeRoles('doctor'),
  getDoctorMessages
);

router.get(
  '/sent',
  authenticate,
  authorizeRoles('secretary', 'doctor'),
  getSentMessages
);

router.patch(
  '/:id/read',
  authenticate,
  authorizeRoles('doctor'),
  markAsRead
);

router.get(
  '/:id/conversation',
  authenticate,
  authorizeRoles('doctor', 'secretary'),
  getConversation
);

router.post(
  '/:id/reply',
  authenticate,
  authorizeRoles('doctor', 'secretary'),
  replyToMessage
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles('doctor', 'secretary'),
  getMessageById
);

module.exports = router;