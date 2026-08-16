import express from 'express';
import { verifyToken, staffOrAbove } from '../middleware/auth.js';
import {
  scanBarcode,
  generateProductBarcodes,
  regenerateBarcode,
  getBarcodes,
  getBarcodesByProduct,
  getStockHistory,
} from '../controllers/barcodeController.js';

const router = express.Router();

router.post('/scan', verifyToken, staffOrAbove, scanBarcode);
router.post('/generate/:productId', verifyToken, staffOrAbove, generateProductBarcodes);
router.post('/regenerate/:barcodeId', verifyToken, staffOrAbove, regenerateBarcode);
router.get('/', verifyToken, staffOrAbove, getBarcodes);
router.get('/stock-history', verifyToken, staffOrAbove, getStockHistory);
router.get('/product/:productId', verifyToken, staffOrAbove, getBarcodesByProduct);

export default router;
