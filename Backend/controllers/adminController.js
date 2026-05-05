const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {

    const logs = await AuditLog.find()
      .populate('userId', 'email role')
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAuditLogs
};