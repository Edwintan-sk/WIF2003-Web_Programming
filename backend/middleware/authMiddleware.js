const jwt = require('jsonwebtoken');

const getTokenFromRequest = (req) => {
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  const authorizationHeader = req.headers.authorization;

  if (
    authorizationHeader &&
    authorizationHeader.startsWith('Bearer ')
  ) {
    return authorizationHeader.split(' ')[1];
  }

  return null;
};

const protectRoute = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured.');
    return res.status(500).json({
      message: 'Authentication is not configured on the server.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Authentication token has expired.',
      });
    }

    return res.status(401).json({
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = {
  protectRoute,
};
