import express from 'express';
import {
  getRacks,
  getRackById,
  createRack,
  updateRack,
  updateRackStatus,
  deleteRack,
} from '../controllers/rackController.js';
import { verifyToken, managerOrAbove } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, managerOrAbove, getRacks);
router.get('/:id', verifyToken, managerOrAbove, getRackById);
router.post('/', verifyToken, managerOrAbove, createRack);
router.put('/:id', verifyToken, managerOrAbove, updateRack);
router.patch('/:id/status', verifyToken, managerOrAbove, updateRackStatus);
router.delete('/:id', verifyToken, managerOrAbove, deleteRack);

export default router;