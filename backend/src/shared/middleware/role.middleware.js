/**
 * Usage: router.post('/', authMiddleware, requireRole('Admin', 'AssetManager'), controller.create)
 * Must run AFTER authMiddleware (needs req.user.role).
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of [${allowedRoles.join(', ')}]`,
      });
    }
    next();
  };
}

module.exports = requireRole;
