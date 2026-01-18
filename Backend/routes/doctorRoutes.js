const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roles');

const {
  getMyProfile,
  updateMyProfile,
} = require('../controllers/doctorController');

// כל הראוטים כאן:
// ✔️ דורשים התחברות
// ✔️ מוגבלים לרופא בלבד

router.get(
  '/me',
  authMiddleware,
  authorizeRoles('doctor'),
  getMyProfile
);

router.put(
  '/me',
  authMiddleware,
  authorizeRoles('doctor'),
  updateMyProfile
);

module.exports = router;