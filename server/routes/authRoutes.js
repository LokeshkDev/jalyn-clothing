import express from 'express';
import {
  loginUser,
  registerUser,
  createUserByAdmin,
  getAllUsers,
  googleAuthUser,
  getMe,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/google', googleAuthUser);
router.post('/users', createUserByAdmin);
router.get('/users', getAllUsers);
router.get('/me', verifyToken, getMe);

// User Addresses CRUD Endpoints
router.get('/addresses', verifyToken, getAddresses);
router.post('/addresses', verifyToken, createAddress);
router.put('/addresses/:id', verifyToken, updateAddress);
router.delete('/addresses/:id', verifyToken, deleteAddress);

export default router;

