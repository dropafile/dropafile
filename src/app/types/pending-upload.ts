export type PendingUploadStatus = "queued" | "uploading";

export type PendingUpload = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: PendingUploadStatus;
};
