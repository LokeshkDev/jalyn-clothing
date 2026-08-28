import express from 'express';
import {
  logConsent,
  getPublicSettings,
  updateSettings,
  getAuditLogs,
  getConsentStats,
} from '../controllers/consentController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public Routes (Shop frontend)
router.post('/log', logConsent);
router.get('/settings', getPublicSettings);

// Admin CMS Routes (Protected)
router.put('/admin/settings', verifyToken, adminOnly, updateSettings);
router.get('/admin/logs', verifyToken, adminOnly, getAuditLogs);
router.get('/admin/stats', verifyToken, adminOnly, getConsentStats);

export default router;

