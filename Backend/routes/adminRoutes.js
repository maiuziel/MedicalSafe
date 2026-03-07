const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const { getAuditLogs } = require('../controllers/adminController');

// רק admin יכול לראות Audit Logs
router.get(
  '/audit-logs',
  authMiddleware,
  authorize('admin'),
  getAuditLogs
);

module.exports = router;