const AuditLog = require('../models/AuditLog');

const auditLogger = async ({
  req,
  action,
  resource,
  resourceId,
}) => {
  try {
    await AuditLog.create({
      userId: req.user?.userId || null,
      role: req.user?.role || 'guest',
      action,
      resource,
      resourceId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = auditLogger;
