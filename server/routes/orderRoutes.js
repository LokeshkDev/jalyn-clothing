import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  returnReplaceOrder,
  getSalesAnalytics,
  getOrderPdf,
} from '../controllers/orderController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getOrders);
router.get('/analytics/sales', verifyToken, adminOnly, getSalesAnalytics);
router.get('/:id/pdf', getOrderPdf);
router.get('/:id', verifyToken, getOrderById);
router.post('/', verifyToken, createOrder);
router.post('/:id/return-replace', verifyToken, adminOnly, returnReplaceOrder);
router.put('/:id', verifyToken, adminOnly, updateOrder);
router.delete('/:id', verifyToken, adminOnly, deleteOrder);

export default router;


