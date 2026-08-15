import type { UploadResponse } from "@shared/types/upload";
import type { UploadMetadata } from "@/types/upload-ui";

export function stripPreview(response: UploadResponse): UploadMetadata {
  const { preview: _preview, ...metadata } = response;
  return metadata;
}
