import type { UploadResponse } from "@shared/types/upload";

export type UploadMetadata = UploadResponse;

export type UploadHistoryEntry = UploadMetadata & {
  id: string;
  uploadedAt: number;
};

export const MAX_UPLOAD_HISTORY = 10;
