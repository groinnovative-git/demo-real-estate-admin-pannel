/**
 * imageCompressor.js
 * ------------------
 * Client-side image compression using the Canvas API.
 * Reduces file size before uploading to the backend.
 *
 * Usage:
 *   import { compressImage, compressImages } from '../utils/imageCompressor';
 *   const compressed = await compressImages(fileArray);
 */

const DEFAULT_OPTIONS = {
    maxWidthOrHeight: 1920, // max pixel dimension (width or height)
    quality: 0.75,          // JPEG/WebP quality  (0.0 – 1.0)
    mimeType: 'image/webp', // output format — WebP gives best size/quality ratio
    maxSizeMB: 1,           // if result > this, re-compress at lower quality
};

/**
 * Compress a single image File.
 *
 * @param {File}   file                    - original image File
 * @param {object} [opts=DEFAULT_OPTIONS]  - compression options
 * @returns {Promise<File>}                - compressed File (same name, new content)
 */
export async function compressImage(file, opts = {}) {
    const options = { ...DEFAULT_OPTIONS, ...opts };

    // Skip non-image files
    if (!file.type.startsWith('image/')) return file;

    // Load image into an HTMLImageElement
    const img = await createImage(file);

    // Calculate scaled dimensions (preserve aspect ratio)
    let { width, height } = img;
    const max = options.maxWidthOrHeight;

    if (width > max || height > max) {
        if (width > height) {
            height = Math.round((height / width) * max);
            width = max;
        } else {
            width = Math.round((width / height) * max);
            height = max;
        }
    }

    // Draw onto a canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // Convert canvas → Blob → File
    let blob = await canvasToBlob(canvas, options.mimeType, options.quality);

    // If still too large, progressively lower quality
    const maxBytes = options.maxSizeMB * 1024 * 1024;
    let quality = options.quality;
    while (blob.size > maxBytes && quality > 0.3) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, options.mimeType, quality);
    }

    // Build a new File with the original name (extension updated)
    const ext = options.mimeType === 'image/webp' ? '.webp'
        : options.mimeType === 'image/jpeg' ? '.jpg'
            : '.png';
    const newName = file.name.replace(/\.[^.]+$/, ext);

    return new File([blob], newName, { type: options.mimeType, lastModified: Date.now() });
}

/**
 * Compress an array of image Files in parallel.
 *
 * @param {File[]}  files           - array of File objects
 * @param {object}  [opts]          - compression options
 * @returns {Promise<File[]>}       - array of compressed Files
 */
export async function compressImages(files, opts = {}) {
    return Promise.all((files || []).map(f => (f ? compressImage(f, opts) : Promise.resolve(null))));
}

// ── Internal helpers ────────────────────────────────────────────────────────

function createImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });
}
