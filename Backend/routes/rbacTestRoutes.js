const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// כל מי שמחובר
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'OK', user: req.user });
});

// רק רופא
router.get('/doctor-only', authenticate, authorize('doctor'), (req, res) => {
  res.json({ message: 'Doctor access granted' });
});

// רק מזכירה
router.get('/secretary-only', authenticate, authorize('secretary'), (req, res) => {
  res.json({ message: 'Secretary access granted' });
});

// רק admin
router.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

module.exports = router;
