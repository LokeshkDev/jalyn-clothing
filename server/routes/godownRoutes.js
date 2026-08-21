import express from 'express';
import {
  getGodowns,
  getGodownById,
  createGodown,
  updateGodown,
  updateGodownStatus,
  deleteGodown,
  getGodownStock,
  getGodownStockById,
  adjustGodownStock,
  getProductGodownStock,
} from '../controllers/godownController.js';
import { verifyToken, managerOrAbove } from '../middleware/auth.js';

const router = express.Router();

router.get('/stock', verifyToken, managerOrAbove, getGodownStock);
router.get('/stock/product/:productId', verifyToken, managerOrAbove, getProductGodownStock);
router.post('/stock/adjust', verifyToken, managerOrAbove, adjustGodownStock);

router.get('/', verifyToken, managerOrAbove, getGodowns);
router.get('/:id', verifyToken, managerOrAbove, getGodownById);
router.get('/:id/stock', verifyToken, managerOrAbove, getGodownStockById);
router.post('/', verifyToken, managerOrAbove, createGodown);
router.put('/:id', verifyToken, managerOrAbove, updateGodown);
router.patch('/:id/status', verifyToken, managerOrAbove, updateGodownStatus);
router.delete('/:id', verifyToken, managerOrAbove, deleteGodown);

export default router;