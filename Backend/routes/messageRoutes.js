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

router.get(
  '/:id',
  authenticate,
  authorizeRoles('doctor', 'secretary'),
  getMessageById
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

module.exports = router;