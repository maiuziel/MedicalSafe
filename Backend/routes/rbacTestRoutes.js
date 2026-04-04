const express = require('express');

// ✅ תיקון import
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// כל מי שמחובר
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'OK', user: req.user });
});

// רק רופא
router.get('/doctor-only', authenticate, authorizeRoles('doctor'), (req, res) => {
  res.json({ message: 'Doctor access granted' });
});

// רק מזכירה
router.get('/secretary-only', authenticate, authorizeRoles('secretary'), (req, res) => {
  res.json({ message: 'Secretary access granted' });
});

// רק admin
router.get('/admin-only', authenticate, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

module.exports = router;