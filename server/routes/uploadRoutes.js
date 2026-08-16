import express from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';

import { verifyToken, staffOrAbove } from '../middleware/auth.js';

const router = express.Router();

router.post('/single', verifyToken, staffOrAbove, upload.single('image'), uploadSingleImage);
router.post('/multiple', verifyToken, staffOrAbove, upload.array('images', 5), uploadMultipleImages);
router.post('/', verifyToken, staffOrAbove, upload.single('file'), uploadSingleImage);

export default router;
