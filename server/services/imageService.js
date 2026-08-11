import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { optimizeImage } from './imageOptimizer.js';
import { isR2Configured, uploadToR2 } from './r2Storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');

/**
 * Optimizes a Multer-uploaded image and stores it in Cloudflare R2
 * (falls back to local disk when R2 is not configured).
 * The local temp file is always cleaned up.
 *
 * @param {Express.Multer.File} file - Multer file object
 * @returns {Promise<{url: string, storage: string, size: number, width: number, height: number, mimetype: string, filename: string}>}
 */
export const processAndStoreImage = async (file) => {
  const fileBuffer = fs.readFileSync(file.path);
  const { buffer, mimetype, ext, width, height } = await optimizeImage(
    fileBuffer,
    file.originalname,
    file.mimetype
  );

  let url;
  let storage;

  if (isR2Configured()) {
    url = await uploadToR2(buffer, file.originalname, mimetype, ext);
    storage = 'cloudflare_r2';
  } else {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    url = `/uploads/${filename}`;
    storage = 'local_multer';
  }

  try {
    fs.unlinkSync(file.path);
  } catch (e) {}

  return {
    url,
    storage,
    size: buffer.length,
    width,
    height,
    mimetype,
  };
};
