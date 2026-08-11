import express from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  recordOfflineSale,
  adjustStock,
  getInventoryTransactions,
} from '../controllers/productController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/inventory/transactions', getInventoryTransactions);
router.get('/:slug', getProductBySlug);

router.post(
  '/',
  verifyToken,
  adminOnly,
  upload.fields([
    { name: 'primary_image', maxCount: 1 },
    { name: 'hover_image', maxCount: 1 },
  ]),
  createProduct
);

router.put('/:id', verifyToken, adminOnly, upload.single('primary_image'), updateProduct);
router.delete('/:id', verifyToken, adminOnly, deleteProduct);

router.post('/:id/offline-sale', verifyToken, adminOnly, recordOfflineSale);
router.post('/:id/adjust-stock', verifyToken, adminOnly, adjustStock);

export default router;

