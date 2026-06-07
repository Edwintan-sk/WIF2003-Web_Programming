/**
 * Role-based access guard. Use AFTER protectRoute so req.user is populated.
 * Example: router.get('/dashboard', protectRoute, requireRole('manager'), handler)
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'You do not have permission to access this resource.',
    });
  }
  return next();
};

module.exports = { requireRole };
