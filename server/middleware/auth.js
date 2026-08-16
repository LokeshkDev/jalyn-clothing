import jwt from 'jsonwebtoken';

/**
 * Strict JWT Verification Middleware
 * Requires a valid Bearer token in the Authorization header.
 * Attaches the decoded payload { id, name, email, role } to req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Valid authorization token required. Please log in.',
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid or missing authentication token.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'jalyn_secret_jwt_key_2026'
    );
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        expired: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid authorization token.',
    });
  }
};

/**
 * Generic Role Checker Middleware
 * @param  {...string} allowedRoles Roles permitted to access the route
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. User role not identified.',
      });
    }

    // Super Admin has access to all admin-level endpoints
    if (req.user.role === 'superadmin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`,
      userRole: req.user.role,
    });
  };
};

/**
 * Super Admin Only: User & Role Management, System Settings
 */
export const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.',
    });
  }
  next();
};

/**
 * Admin & Super Admin: CMS, Coupons, Product/Category Management, Sales
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || !['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
  next();
};

/**
 * Manager, Admin & Super Admin: Products, Categories, Orders, Inventory
 */
export const managerOrAbove = (req, res, next) => {
  if (!req.user || !['superadmin', 'admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Store Manager privileges or higher required.',
    });
  }
  next();
};

/**
 * Staff, Manager, Admin & Super Admin: Scanner, Barcodes, Stock History, Order Inspection
 */
export const staffOrAbove = (req, res, next) => {
  if (!req.user || !['superadmin', 'admin', 'manager', 'staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff privileges or higher required.',
    });
  }
  next();
};
