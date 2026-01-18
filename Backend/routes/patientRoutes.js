const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');

const {
  getMyProfile,
  updateMyProfile,
} = require('../controllers/patientController');

// כל הראוטים כאן:
// ✔️ דורשים התחברות
// ✔️ מוגבלים למטופל בלבד

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

module.exports = router;