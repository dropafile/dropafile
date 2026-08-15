import type { UploadResponse } from "@shared/types/upload";
import { TEXT_SNIPPET_LENGTH } from "./constants";

export function buildTextPreview(
  buffer: Uint8Array,
): Pick<UploadResponse, "metadata" | "preview"> {
  const text = new TextDecoder("utf-8").decode(buffer);
  const lines = text.split(/\r?\n/).length;

  return {
    metadata: {
      characters: text.length,
      lines,
    },
    preview: {
      text: text.slice(0, TEXT_SNIPPET_LENGTH),
    },
  };
}
