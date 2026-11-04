const AuditLog = require('../models/AuditLog');

const recordAudit = async ({ actorId, action, entityType, entityId, metadata = {} }) => {
  try {
    await AuditLog.create({
      actorId,
      action,
      entityType,
      entityId,
      metadata,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = { recordAudit };
