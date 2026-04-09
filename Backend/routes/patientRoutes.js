const express = require('express');
const router = express.Router();

// ✅ תיקון import
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const {
  getMyProfile,
  updateMyProfile,
  createFeedback,
  getPatientById
} = require('../controllers/patientController');

const {
  createRequest,
  getPatientRequests,
  getPatientRequestById
} = require('../controllers/requestController');


// 🔹 פרופיל מטופל
router.get(
  '/me',
  authenticate,
  authorizeRoles('patient'),
  getMyProfile
);

router.put(
  '/me',
  authenticate,
  authorizeRoles('patient'),
  updateMyProfile
);

// 🔹 משוב
router.post(
  '/feedback',
  authenticate,
  authorizeRoles('patient'),
  createFeedback
);


// יצירת פנייה
router.post(
  '/requests',
  authenticate,
  authorizeRoles('patient'),
  createRequest
);

// קבלת כל הפניות של המטופל
router.get(
  '/requests',
  authenticate,
  authorizeRoles('patient'),
  getPatientRequests
);
router.get("/:id", authenticate, getPatientById);
// קבלת פנייה לפי ID
router.get(
  '/requests/:requestId',
  authenticate,
  authorizeRoles('patient'),
  getPatientRequestById
);

module.exports = router;