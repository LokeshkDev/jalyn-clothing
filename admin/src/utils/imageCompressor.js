/**
 * Client-side Image Compression Utility
 * Resizes and compresses image files using HTML5 Canvas before uploading to the server.
 * This prevents HTTP 413 (Payload Too Large) errors from Nginx/Cloudflare and dramatically speeds up uploads.
 */

export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1800,
    maxHeight = 2200,
    quality = 0.85,
    maxSizeMB = 1.5,
  } = options;

  // Don't compress non-image or vector files (SVG / GIF)
  if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Use smooth image smoothing for crisp results
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern webp if supported, otherwise fallback to jpeg
        const outputMime = file.type === 'image/png' && file.size < 800 * 1024 ? 'image/png' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to original if blob creation fails
              return;
            }

            // Create a new File object with original name and new extension if converted
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const ext = outputMime === 'image/jpeg' ? '.jpg' : (outputMime === 'image/webp' ? '.webp' : '.png');
            const compressedFile = new File([blob], `${originalName}${ext}`, {
              type: outputMime,
              lastModified: Date.now(),
            });

            console.log(`📸 Image compressed: ${(file.size / 1024).toFixed(1)} KB ➔ ${(compressedFile.size / 1024).toFixed(1)} KB`);
            resolve(compressedFile);
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // Fallback to original
      };
    };

    reader.onerror = () => {
      resolve(file); // Fallback to original
    };
  });
};
