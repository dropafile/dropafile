export const FILE_CHUNK_SIZE = 48 * 1024;

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function readFileChunk(
  file: File,
  chunkIndex: number,
  chunkSize = FILE_CHUNK_SIZE,
): Promise<{ chunkIndex: number; totalChunks: number; data: string }> {
  const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
  const start = chunkIndex * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  const slice = file.slice(start, end);
  const buffer = await slice.arrayBuffer();
  const data = arrayBufferToBase64(buffer);

  return { chunkIndex, totalChunks, data };
}

export function assembleChunks(
  chunks: string[],
  mimeType: string,
): Blob {
  const parts = chunks.map((chunk) => base64ToUint8Array(chunk) as BlobPart);
  return new Blob(parts, { type: mimeType || "application/octet-stream" });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
