import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyToken, adminOnly, upload.single('image'), createCategory);
router.put('/:id', verifyToken, adminOnly, upload.single('image'), updateCategory);
router.patch('/:id', verifyToken, adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, adminOnly, deleteCategory);

export default router;
