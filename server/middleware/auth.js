import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'jalyn_secret_jwt_key_2026'
        );
        req.user = decoded;
        return next();
      } catch (error) {
        console.warn('JWT verification failed:', error.message);
      }
    }
  }

  // In development mode, auto-authorize as admin if no valid token present
  if (process.env.NODE_ENV !== 'production') {
    req.user = {
      id: 1,
      name: 'Admin User',
      email: 'admin@jalyn.com',
      role: 'admin',
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Access denied. Valid authorization token required.',
  });
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }
  next();
};
