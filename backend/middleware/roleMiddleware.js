const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Access denied. ${req.user.role} cannot access this resource` 
        });
      }
      
      next();
    };
  };
  
  module.exports = { restrictTo };