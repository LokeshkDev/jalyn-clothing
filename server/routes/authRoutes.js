import express from 'express';
import {
  loginUser,
  registerUser,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  changePassword,
  superAdminResetPassword,
  getAllUsers,
  googleAuthUser,
  getMe,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { verifyToken, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public Authentication
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/google', googleAuthUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Current User Profile & Self-Service Password Change
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, changePassword);

// User & Role Management — EXCLUSIVE TO SUPER ADMIN
router.get('/users', verifyToken, superAdminOnly, getAllUsers);
router.post('/users', verifyToken, superAdminOnly, createUserByAdmin);
router.put('/users/:id', verifyToken, superAdminOnly, updateUserByAdmin);
router.post('/users/:id/reset-password', verifyToken, superAdminOnly, superAdminResetPassword);
router.delete('/users/:id', verifyToken, superAdminOnly, deleteUserByAdmin);

// User Addresses CRUD Endpoints (Customer / Admin self)
router.get('/addresses', verifyToken, getAddresses);
router.post('/addresses', verifyToken, createAddress);
router.put('/addresses/:id', verifyToken, updateAddress);
router.delete('/addresses/:id', verifyToken, deleteAddress);

export default router;
