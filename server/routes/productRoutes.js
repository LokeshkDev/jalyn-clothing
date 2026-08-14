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
  updateNewArrivalStatus,
  updateNewArrivalsBulk,
  reorderNewArrivals,
  updateSaleStatus,
  updateSalesBulk,
  reorderSales,
} from '../controllers/productController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/inventory/transactions', getInventoryTransactions);

// New Arrivals Endpoints
router.patch('/new-arrivals/bulk', verifyToken, adminOnly, updateNewArrivalsBulk);
router.patch('/new-arrivals/reorder', verifyToken, adminOnly, reorderNewArrivals);
router.patch('/:id/new-arrival', verifyToken, adminOnly, updateNewArrivalStatus);

// Sales Page Endpoints
router.patch('/sales/bulk', verifyToken, adminOnly, updateSalesBulk);
router.patch('/sales/reorder', verifyToken, adminOnly, reorderSales);
router.patch('/:id/sale', verifyToken, adminOnly, updateSaleStatus);

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

