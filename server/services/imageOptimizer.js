import sharp from 'sharp';
import path from 'path';

// Maximum dimension for stored images (downscaled only, never upscaled)
const MAX_DIMENSION = 1920;

// WebP quality — visually lossless while drastically reducing file size
const WEBP_QUALITY = 85;

/**
 * Optimizes an uploaded image without visible quality loss:
 * - Fixes EXIF rotation
 * - Downscales images larger than MAX_DIMENSION (no upscaling, so small images stay sharp)
 * - Re-encodes as WebP (best quality-per-byte) at high quality
 * - Keeps the original file if optimization would not shrink it
 * - Keeps animated GIFs untouched
 *
 * @param {Buffer} fileBuffer - raw file buffer from Multer
 * @param {string} originalName - original uploaded filename
 * @param {string} originalMime - original mimetype
 * @returns {{buffer: Buffer, mimetype: string, ext: string, width: number, height: number}}
 */
export const optimizeImage = async (fileBuffer, originalName, originalMime) => {
  try {
    const image = sharp(fileBuffer, { failOn: 'none', animated: true }).rotate();
    const metadata = await image.metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const isAnimatedGif = metadata.pages && metadata.pages > 1;

    // Never convert animated GIFs — would flatten animation
    if (isAnimatedGif || originalMime === 'image/gif') {
      return {
        buffer: fileBuffer,
        mimetype: originalMime,
        ext: '.gif',
        width,
        height,
      };
    }

    // Downscale only when the image is larger than the limit — never upscale
    const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;
    let pipeline = image;

    if (needsResize) {
      pipeline = pipeline.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const optimizedBuffer = await pipeline
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();

    // If WebP did not shrink the file (e.g. already-compressed image),
    // keep the original to avoid any quality loss for zero size gain
    if (optimizedBuffer.length >= fileBuffer.length) {
      return {
        buffer: fileBuffer,
        mimetype: originalMime,
        ext: path.extname(originalName).toLowerCase() || '.jpg',
        width,
        height,
      };
    }

    return {
      buffer: optimizedBuffer,
      mimetype: 'image/webp',
      ext: '.webp',
      width: needsResize ? Math.min(width, MAX_DIMENSION) : width,
      height: needsResize ? Math.min(height, MAX_DIMENSION) : height,
    };
  } catch (error) {
    // If optimization fails, fall back to the original file untouched
    return {
      buffer: fileBuffer,
      mimetype: originalMime,
      ext: path.extname(originalName).toLowerCase() || '.jpg',
      width: 0,
      height: 0,
    };
  }
};
