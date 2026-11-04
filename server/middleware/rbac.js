const NGOProfile = require('../models/NGOProfile');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role.`,
      });
    }

    next();
  };
};

// Ensures NGO is officially verified and approved before requesting food
const requireVerifiedNGO = async (req, res, next) => {
  if (req.user.role !== 'ngo') {
    return res.status(403).json({
      success: false,
      message: 'This operation is restricted to NGO organizations.',
    });
  }

  try {
    const profile = await NGOProfile.findOne({ userId: req.user._id });
    if (!profile || profile.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your NGO profile is currently ${profile ? profile.verificationStatus : 'unregistered'}. Administrator approval is required before requesting food.`,
      });
    }

    req.ngoProfile = profile;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify NGO standing.',
      error: err.message,
    });
  }
};

module.exports = { requireRole, requireVerifiedNGO };
