import express from 'express';
import {
  getFilterOptions,
  createFilterOption,
  deleteFilterOption,
} from '../controllers/filterOptionController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFilterOptions);
router.post('/', verifyToken, adminOnly, createFilterOption);
router.delete('/:id', verifyToken, adminOnly, deleteFilterOption);

export default router;