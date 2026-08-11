import { isR2Configured } from '../services/r2Storage.js';
import { processAndStoreImage } from '../services/imageService.js';

export const uploadSingleImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or invalid file format.',
    });
  }

  try {
    const { url, storage, size, width, height, mimetype } = await processAndStoreImage(req.file);

    const finalUrl = storage === 'local_multer'
      ? `${req.protocol}://${req.get('host')}${url}`
      : url;

    return res.status(200).json({
      success: true,
      storage,
      message: `Image uploaded successfully (optimized to ${(size / 1024).toFixed(1)} KB).`,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype,
        size,
        width,
        height,
        url: finalUrl,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message,
    });
  }
};

export const uploadMultipleImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded.',
    });
  }

  try {
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const { url, storage, size, width, height, mimetype } = await processAndStoreImage(file);
        return {
          filename: file.filename,
          originalname: file.originalname,
          mimetype,
          size,
          width,
          height,
          url: storage === 'local_multer'
            ? `${req.protocol}://${req.get('host')}${url}`
            : url,
        };
      })
    );

    return res.status(200).json({
      success: true,
      storage: isR2Configured() ? 'cloudflare_r2' : 'local_multer',
      message: `${uploadedFiles.length} images uploaded successfully (optimized).`,
      files: uploadedFiles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message,
    });
  }
};
