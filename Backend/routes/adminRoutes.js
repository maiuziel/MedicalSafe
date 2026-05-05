const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const { getAuditLogs } = require('../controllers/adminController');

router.get(
  '/audit-logs',
  authenticate,
  authorizeRoles('admin'),
  getAuditLogs
);

module.exports = router;