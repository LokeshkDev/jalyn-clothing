import fs from 'fs';
import { isR2Configured, uploadToR2 } from '../services/r2Storage.js';

export const uploadSingleImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or invalid file format.',
    });
  }

  try {
    // If Cloudflare R2 credentials are configured in .env, upload to R2
    if (isR2Configured()) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const r2Url = await uploadToR2(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Clean up local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}

      return res.status(200).json({
        success: true,
        storage: 'cloudflare_r2',
        message: 'Image uploaded to Cloudflare R2 successfully.',
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: r2Url,
        },
      });
    }

    // Fallback to local Multer static URL
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      storage: 'local_multer',
      message: 'Image uploaded to local storage successfully.',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
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
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const useR2 = isR2Configured();

    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        let fileUrl = `${serverUrl}/uploads/${file.filename}`;

        if (useR2) {
          try {
            const fileBuffer = fs.readFileSync(file.path);
            fileUrl = await uploadToR2(fileBuffer, file.originalname, file.mimetype);
            try {
              fs.unlinkSync(file.path);
            } catch (e) {}
          } catch (r2Err) {
            console.warn('R2 upload failed for file, using local fallback:', r2Err.message);
          }
        }

        return {
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: fileUrl,
        };
      })
    );

    return res.status(200).json({
      success: true,
      storage: useR2 ? 'cloudflare_r2' : 'local_multer',
      message: `${uploadedFiles.length} images uploaded successfully.`,
      files: uploadedFiles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message,
    });
  }
};
