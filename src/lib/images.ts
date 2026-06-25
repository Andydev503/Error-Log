import { IMAGE_BUCKET } from "./constants";

/** Build a public URL for an object stored in the image bucket. */
export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Downscale a pasted/uploaded image on the client before upload so screenshots
 * stay sharp but reasonably sized. Keeps aspect ratio; never upscales.
 */
export async function resizeImage(
  file: Blob,
  maxDimension = 1600,
  quality = 0.85,
): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { blob: file, width, height };
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
      "image/webp",
      quality,
    );
  });

  return { blob, width: targetW, height: targetH };
}

/** Extract an image File/Blob from a paste event, if present. */
export function imageFromClipboard(
  items: DataTransferItemList | null,
): File | null {
  if (!items) return null;
  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
