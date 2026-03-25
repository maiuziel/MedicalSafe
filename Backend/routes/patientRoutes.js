const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');

const {
  getMyProfile,
  updateMyProfile,
  createFeedback
} = require('../controllers/patientController');

const {
  createRequest,
  getPatientRequests,
  getPatientRequestById
} = require('../controllers/requestController');


// 🔹 פרופיל מטופל
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

// 🔹 משוב
router.post(
  '/feedback',
  authMiddleware,
  authorizeRoles('patient'),
  createFeedback
);


// יצירת פנייה
router.post(
  '/requests',
  authMiddleware,
  authorizeRoles('patient'),
  createRequest
);

// קבלת כל הפניות של המטופל
router.get(
  '/requests',
  authMiddleware,
  authorizeRoles('patient'),
  getPatientRequests
);

// קבלת פנייה לפי ID
router.get(
  '/requests/:requestId',
  authMiddleware,
  authorizeRoles('patient'),
  getPatientRequestById
);


module.exports = router;