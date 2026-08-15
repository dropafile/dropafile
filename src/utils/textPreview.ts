import type { UploadResponse } from "@shared/types/upload";

export function buildTextMetadata(
  buffer: Uint8Array,
): Pick<UploadResponse, "metadata"> {
  const text = new TextDecoder("utf-8").decode(buffer);
  const lines = text.split(/\r?\n/).length;

  return {
    metadata: {
      characters: text.length,
      lines,
    },
  };
}
