const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');
const { createFeedback } = require('../controllers/patientController');

const {
  getMyProfile,
  updateMyProfile,
} = require('../controllers/patientController');


router.get(
  '/me',
  authMiddleware,
  authorizeRoles('patient'),
  getMyProfile
);

router.put(
  '/me',
  authMiddleware,
  authorizeRoles('patient'),
  updateMyProfile
);

router.post(
  '/feedback',
  authMiddleware,
  authorizeRoles('patient'),
  createFeedback
);

module.exports = router;