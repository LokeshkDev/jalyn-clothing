/**
 * Compatibility shim for legacy imports expecting `authMiddleware.js`
 * Re-exports from `auth.js` with both original and alias names.
 * Original file: server/middleware/auth.js exports: verifyToken, requireRoles, superAdminOnly, adminOnly, managerOrAbove, staffOrAbove
 * Alias exports: authenticateToken -> verifyToken, requireRole -> requireRoles, verifyAdminToken -> adminOnly
 */
export { verifyToken, requireRoles, superAdminOnly, adminOnly, managerOrAbove, staffOrAbove } from './auth.js';

// Aliases for legacy code that imports `authenticateToken` / `requireRole`
export { verifyToken as authenticateToken } from './auth.js';
export { requireRoles as requireRole } from './auth.js';
export { adminOnly as verifyAdminToken } from './auth.js';
export { verifyToken as authenticate } from './auth.js';
export { verifyToken as protect } from './auth.js';
