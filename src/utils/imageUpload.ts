import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export function isBase64DataUrl(str?: string): boolean {
  if (!str) return false;
  return str.startsWith('data:image/');
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Compresses an image to max 1200px width/height and guarantees it is under maxBytes (default 300 KB).
 */
export async function compressImage(
  source: File | Blob | string,
  maxDimension = 1200,
  maxBytes = 300 * 1024
): Promise<Blob> {
  let blob: Blob;
  if (typeof source === 'string') {
    if (isBase64DataUrl(source)) {
      blob = dataUrlToBlob(source);
    } else {
      // If it's a URL, fetch it as blob
      const res = await fetch(source);
      blob = await res.blob();
    }
  } else {
    blob = source;
  }

  // Load image onto Image element
  const imgBitmap = await createImageBitmap(blob).catch(async () => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  });

  const origWidth = imgBitmap.width;
  const origHeight = imgBitmap.height;

  // Scale down to max 1200px
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
    throw new Error('Canvas 2D context not supported');
  }

  // Draw scaled image
  ctx.drawImage(imgBitmap as any, 0, 0, targetWidth, targetHeight);

  // Attempt WebP first, fallback to JPEG
  const testCanvas = document.createElement('canvas');
  const supportsWebP = testCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';

  let quality = 0.82;
  let compressedBlob: Blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b || blob), mimeType, quality)
  );

  // Iteratively reduce quality until under maxBytes (300 KB)
  while (compressedBlob.size > maxBytes && quality > 0.35) {
    quality -= 0.12;
    const nextBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b || compressedBlob), mimeType, quality)
    );
    compressedBlob = nextBlob;
  }

  return compressedBlob;
}

/**
 * Compresses an image and uploads it to Firebase Storage.
 * Returns the permanent HTTPS download URL.
 */
export async function uploadImageToStorage(
  source: File | Blob | string,
  folder = 'products',
  customName?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const compressedBlob = await compressImage(source, 1200, 300 * 1024);
  const ext = compressedBlob.type.includes('webp') ? 'webp' : 'jpg';
  const name =
    customName ||
    `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const storageRef = ref(storage, `${folder}/${name}`);

  const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
    contentType: compressedBlob.type,
    cacheControl: 'public, max-age=31536000',
  });

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
