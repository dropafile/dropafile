import type { UploadResponse } from "@shared/types/upload";
import { bytesToBase64 } from "./bytes";
import {
  decodeImage,
  encodeJpeg,
  encodePng,
  type DecodedImage,
} from "./imageCodecs";

const MAX_THUMB = 200;

function resizeNearest(
  image: DecodedImage,
  targetWidth: number,
  targetHeight: number,
): DecodedImage {
  const data = new Uint8Array(targetWidth * targetHeight * 4);
  const { width, height } = image;

  for (let y = 0; y < targetHeight; y++) {
    const sourceY = Math.min(height - 1, Math.floor((y * height) / targetHeight));
    for (let x = 0; x < targetWidth; x++) {
      const sourceX = Math.min(width - 1, Math.floor((x * width) / targetWidth));
      const sourceIndex = (sourceY * width + sourceX) * 4;
      const targetIndex = (y * targetWidth + x) * 4;
      data[targetIndex] = image.data[sourceIndex];
      data[targetIndex + 1] = image.data[sourceIndex + 1];
      data[targetIndex + 2] = image.data[sourceIndex + 2];
      data[targetIndex + 3] = image.data[sourceIndex + 3];
    }
  }

  return { width: targetWidth, height: targetHeight, data };
}

export async function buildImagePreview(
  buffer: Uint8Array,
  mime: string,
): Promise<Pick<UploadResponse, "metadata" | "preview">> {
  const isPng = mime === "image/png";
  const isJpeg = mime === "image/jpeg";

  if (!isPng && !isJpeg) {
    throw new Error("Only PNG and JPEG images are supported.");
  }

  const source = await decodeImage(buffer, mime);
  const scale = Math.min(MAX_THUMB / source.width, MAX_THUMB / source.height, 1);
  const thumbWidth = Math.max(1, Math.round(source.width * scale));
  const thumbHeight = Math.max(1, Math.round(source.height * scale));
  const thumbnail = resizeNearest(source, thumbWidth, thumbHeight);
  const encoded = isPng
    ? await encodePng(thumbnail)
    : await encodeJpeg(thumbnail, 85);
  const previewMime = isPng ? "image/png" : "image/jpeg";

  return {
    metadata: {
      width: source.width,
      height: source.height,
      format: isPng ? "png" : "jpeg",
      thumbnail_width: thumbWidth,
      thumbnail_height: thumbHeight,
    },
    preview: {
      image: `data:${previewMime};base64,${bytesToBase64(encoded)}`,
    },
  };
}
