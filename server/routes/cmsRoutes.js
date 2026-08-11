import express from 'express';
import { getHomepageSections, updateHomepageSection } from '../controllers/cmsController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/homepage', getHomepageSections);
router.put(
  '/homepage/:sectionKey',
  verifyToken,
  adminOnly,
  upload.single('image'),
  updateHomepageSection
);

export default router;
