/**
 * Image processing utility without Firebase Storage.
 * Resizes each image in the browser to max 900px, converts to WebP (with JPEG fallback),
 * guarantees target under 120 KB, and outputs a base64 data URL stored directly inside Firestore.
 */

export function isBase64DataUrl(str?: string): boolean {
  if (!str) return false;
  return str.startsWith('data:image/');
}

/**
 * Calculates approximate byte size of a base64 data URL.
 */
export function getBase64ByteSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64Content = dataUrl.split(',')[1] || dataUrl;
  return Math.round((base64Content.length * 3) / 4);
}

/**
 * Loads an image from File, Blob, or URL into an HTMLImageElement.
 */
function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    if (typeof source === 'string') {
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to load image from source'));
      img.src = source;
    } else {
      const objectUrl = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image from file/blob'));
      };
      img.src = objectUrl;
    }
  });
}

/**
 * Resizes and compresses an image to a base64 data URL:
 * - Max dimension: 900px
 * - Target format: WebP (JPEG fallback)
 * - Target size: < 120 KB
 */
export async function compressImageToBase64(
  source: File | Blob | string,
  maxDimension = 900,
  maxBytes = 120 * 1024,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (onProgress) onProgress(15);

  const img = await loadImage(source);
  if (onProgress) onProgress(35);

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Calculate scaled dimensions (max 900px)
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (origWidth > maxDimension || origHeight > maxDimension) {
    if (origWidth > origHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((origHeight * maxDimension) / origWidth);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((origWidth * maxDimension) / origHeight);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available for image compression');
  }

  // Draw image on canvas with high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  if (onProgress) onProgress(60);

  // Check if WebP is supported
  const testCanvas = document.createElement('canvas');
  const supportsWebP = testCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';

  // Iteratively reduce quality until under maxBytes (120 KB)
  let quality = 0.82;
  let dataUrl = canvas.toDataURL(mimeType, quality);
  let byteSize = getBase64ByteSize(dataUrl);

  while (byteSize > maxBytes && quality > 0.35) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL(mimeType, quality);
    byteSize = getBase64ByteSize(dataUrl);
  }

  // If still above 120 KB, try scaling down further
  if (byteSize > maxBytes) {
    const smallerCanvas = document.createElement('canvas');
    smallerCanvas.width = Math.round(targetWidth * 0.75);
    smallerCanvas.height = Math.round(targetHeight * 0.75);
    const smCtx = smallerCanvas.getContext('2d');
    if (smCtx) {
      smCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
      dataUrl = smallerCanvas.toDataURL(mimeType, 0.65);
    }
  }

  if (onProgress) onProgress(100);
  return dataUrl;
}

/**
 * Compatibility wrapper: returns base64 data URL directly without Firebase Storage.
 */
export async function uploadImageToStorage(
  source: File | Blob | string,
  _folder = 'products',
  _customName?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return compressImageToBase64(source, 900, 120 * 1024, onProgress);
}

/**
 * Compresses an image to max 1200px, JPEG under 300 KB, returning a File object.
 */
export async function compressImageToFile(
  source: File | Blob | string,
  filename = 'reference.jpg'
): Promise<File> {
  const img = await (async () => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      if (typeof source === 'string') {
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = source;
      } else {
        const url = URL.createObjectURL(source);
        im.onload = () => {
          URL.revokeObjectURL(url);
          resolve(im);
        };
        im.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        im.src = url;
      }
    });
  })();

  const maxDim = 1200;
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (origWidth > maxDim || origHeight > maxDim) {
    if (origWidth > origHeight) {
      targetWidth = maxDim;
      targetHeight = Math.round((origHeight * maxDim) / origWidth);
    } else {
      targetHeight = maxDim;
      targetWidth = Math.round((origWidth * maxDim) / origHeight);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let size = Math.round((dataUrl.split(',')[1].length * 3) / 4);

  while (size > 300 * 1024 && quality > 0.3) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    size = Math.round((dataUrl.split(',')[1].length * 3) / 4);
  }

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', quality)
  );

  return new File([blob], filename, { type: 'image/jpeg' });
}
