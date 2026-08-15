import type { UploadErrorResponse, UploadResponse } from "@shared/types/upload";

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as UploadResponse | UploadErrorResponse;

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Upload failed.");
  }

  return data;
}
