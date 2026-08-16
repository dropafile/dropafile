import type { UploadErrorResponse, UploadResponse } from "@shared/types/upload";

export async function uploadFile(file: File): Promise<UploadResponse> {
  return uploadFileWithProgress(file);
}

export function uploadFileWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", "/api/upload");

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress?.(progress);
    });

    xhr.addEventListener("load", () => {
      let data: UploadResponse | UploadErrorResponse;

      try {
        data = JSON.parse(xhr.responseText) as
          | UploadResponse
          | UploadErrorResponse;
      } catch {
        reject(new Error("Upload failed."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || "error" in data) {
        reject(
          new Error("error" in data ? data.error : "Upload failed."),
        );
        return;
      }

      onProgress?.(100);
      resolve(data);
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled."));
    });

    xhr.send(formData);
  });
}
