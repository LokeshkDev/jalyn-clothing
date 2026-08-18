import express from 'express';
import {
  subscribeNewsletter,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
} from '../controllers/newsletterController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', verifyToken, adminOnly, getNewsletterSubscribers);
router.delete('/subscribers/:id', verifyToken, adminOnly, deleteNewsletterSubscriber);

export default router;