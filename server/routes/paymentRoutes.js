import express from 'express';
import { createCashfreeOrder, verifyCashfreePayment } from '../controllers/paymentController.js';

const router = express.Router();

// Cashfree Order Creation Endpoint
router.post('/cashfree/create-order', createCashfreeOrder);

// Cashfree Payment Verification Endpoint
router.post('/cashfree/verify', verifyCashfreePayment);

export default router;
