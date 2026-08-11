import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyToken, adminOnly, upload.single('image'), createCategory);
router.delete('/:id', verifyToken, adminOnly, deleteCategory);

export default router;
