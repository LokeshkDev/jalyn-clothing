import express from 'express';
import {
  getVendors,
  getVendorById,
  getVendorProducts,
  createVendor,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
} from '../controllers/vendorController.js';
import { verifyToken, managerOrAbove } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, managerOrAbove, getVendors);
router.get('/:id', verifyToken, managerOrAbove, getVendorById);
router.get('/:id/products', verifyToken, managerOrAbove, getVendorProducts);
router.post('/', verifyToken, managerOrAbove, createVendor);
router.put('/:id', verifyToken, managerOrAbove, updateVendor);
router.patch('/:id/status', verifyToken, managerOrAbove, updateVendorStatus);
router.delete('/:id', verifyToken, managerOrAbove, deleteVendor);

export default router;
