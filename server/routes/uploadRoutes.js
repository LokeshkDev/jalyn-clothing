import express from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/single', upload.single('image'), uploadSingleImage);
router.post('/multiple', upload.array('images', 5), uploadMultipleImages);
router.post('/', upload.single('file'), uploadSingleImage);

export default router;
