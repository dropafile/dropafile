import { fileTypeFromBuffer } from "file-type";
import type { FileKind } from "@shared/types/upload";
import {
  IMAGE_EXTENSIONS,
  IMAGE_MIMES,
  PDF_MIMES,
  TEXT_EXTENSIONS,
  TEXT_MIMES,
  ZIP_MIMES,
} from "./constants";
import { extensionFromName } from "./extension";

export type ClassifiedFile = {
  kind: FileKind;
  mime: string | null;
  ext: string | null;
};

export async function classifyFile(
  buffer: Uint8Array,
  filename: string,
  declaredType: string,
): Promise<ClassifiedFile> {
  const detected = await fileTypeFromBuffer(buffer);
  const detectedMime = detected?.mime ?? null;
  const detectedExt = detected?.ext ?? null;
  const nameExt = extensionFromName(filename);

  if (detectedMime && IMAGE_MIMES.has(detectedMime)) {
    return { kind: "image", mime: detectedMime, ext: detectedExt };
  }

  if (detectedMime && PDF_MIMES.has(detectedMime)) {
    return { kind: "pdf", mime: detectedMime, ext: detectedExt };
  }

  if (detectedMime && ZIP_MIMES.has(detectedMime)) {
    return { kind: "zip", mime: detectedMime, ext: detectedExt };
  }

  if (detectedMime && TEXT_MIMES.has(detectedMime)) {
    return { kind: "text", mime: detectedMime, ext: detectedExt };
  }

  if (nameExt && IMAGE_EXTENSIONS.has(nameExt)) {
    return {
      kind: "image",
      mime: detectedMime ?? (nameExt === "png" ? "image/png" : "image/jpeg"),
      ext: nameExt,
    };
  }

  if (nameExt === "pdf") {
    return { kind: "pdf", mime: detectedMime ?? "application/pdf", ext: "pdf" };
  }

  if (nameExt === "zip") {
    return { kind: "zip", mime: detectedMime ?? "application/zip", ext: "zip" };
  }

  if (nameExt && TEXT_EXTENSIONS.has(nameExt)) {
    return {
      kind: "text",
      mime:
        detectedMime ??
        (nameExt === "json" ? "application/json" : declaredType || "text/plain"),
      ext: nameExt,
    };
  }

  if (declaredType && TEXT_MIMES.has(declaredType)) {
    return { kind: "text", mime: declaredType, ext: nameExt };
  }

  return { kind: "unsupported", mime: detectedMime, ext: detectedExt ?? nameExt };
}
