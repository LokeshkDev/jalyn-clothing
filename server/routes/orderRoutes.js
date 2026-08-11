import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, adminOnly, getOrders);
router.get('/:id', verifyToken, adminOnly, getOrderById);
router.post('/', verifyToken, adminOnly, createOrder);
router.put('/:id', verifyToken, adminOnly, updateOrder);
router.delete('/:id', verifyToken, adminOnly, deleteOrder);

export default router;
