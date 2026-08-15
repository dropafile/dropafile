import type { UploadResponse } from "@shared/types/upload";
import { decodeImage } from "./imageCodecs";

export async function buildImageMetadata(
  buffer: Uint8Array,
  mime: string,
): Promise<Pick<UploadResponse, "metadata">> {
  const isPng = mime === "image/png";
  const isJpeg = mime === "image/jpeg";

  if (!isPng && !isJpeg) {
    throw new Error("Only PNG and JPEG images are supported.");
  }

  const source = await decodeImage(buffer, mime);

  return {
    metadata: {
      width: source.width,
      height: source.height,
      format: isPng ? "png" : "jpeg",
    },
  };
}
