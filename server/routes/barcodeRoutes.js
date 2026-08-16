import express from 'express';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import {
  scanBarcode,
  generateProductBarcodes,
  regenerateBarcode,
  getBarcodes,
  getBarcodesByProduct,
  getStockHistory,
} from '../controllers/barcodeController.js';

const router = express.Router();

router.post('/scan', verifyToken, adminOnly, scanBarcode);
router.post('/generate/:productId', verifyToken, adminOnly, generateProductBarcodes);
router.post('/regenerate/:barcodeId', verifyToken, adminOnly, regenerateBarcode);
router.get('/', verifyToken, adminOnly, getBarcodes);
router.get('/stock-history', verifyToken, adminOnly, getStockHistory);
router.get('/product/:productId', verifyToken, adminOnly, getBarcodesByProduct);

export default router;
