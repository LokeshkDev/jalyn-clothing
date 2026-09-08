import express from 'express';
import {
  getMyJCoinsBalance,
  getMyJCoinsHistory,
  lookupCustomerByPhone,
  getAdminUserJCoinsHistory,
  adminAdjustUserJCoins,
} from '../controllers/jcoinController.js';
import { verifyToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Customer Endpoints
router.get('/balance', verifyToken, getMyJCoinsBalance);
router.get('/history', verifyToken, getMyJCoinsHistory);

// Public / POS / Checkout Phone Lookup Endpoint
router.get('/lookup', lookupCustomerByPhone);

// Admin Endpoints
router.get('/admin/users/:id/history', verifyToken, requireRoles('superadmin', 'admin', 'manager'), getAdminUserJCoinsHistory);
router.post('/admin/users/:id/adjust', verifyToken, requireRoles('superadmin', 'admin'), adminAdjustUserJCoins);

export default router;

