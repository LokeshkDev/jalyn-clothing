import express from 'express';
import {
  getActiveCoupons,
  getAllCoupons,
  createCoupon,
  generateCoupons,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getActiveCoupons);
router.get('/all', verifyToken, adminOnly, getAllCoupons);
router.post('/', verifyToken, adminOnly, createCoupon);
router.post('/generate', verifyToken, adminOnly, generateCoupons);
router.put('/:id', verifyToken, adminOnly, updateCoupon);
router.delete('/:id', verifyToken, adminOnly, deleteCoupon);

export default router;