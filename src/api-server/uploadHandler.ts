import type { UploadResponse } from "@shared/types/upload";
import { classifyFile } from "@shared/utils/fileClassifier";
import { buildImageMetadata } from "@shared/utils/imagePreview";
import { buildTextMetadata } from "@shared/utils/textPreview";

type UploadedFile = {
  name: string;
  type: string;
  size: number;
  buffer: Uint8Array;
};

export async function handleUpload(file: UploadedFile): Promise<{
  status: number;
  body: UploadResponse | { error: string };
}> {
  let kind: UploadResponse["kind"] | undefined;
  let mime: string | null = null;
  let ext: string | null = null;

  try {
    ({ kind, mime, ext } = await classifyFile(
      file.buffer,
      file.name,
      file.type,
    ));

    if (kind === "unsupported") {
      return {
        status: 415,
        body: {
          error:
            "Unsupported file type. Supported: PNG, JPEG, plain text, JSON, PDF, and ZIP.",
        },
      };
    }
  } catch (err) {
    if (kind === "image") {
      return {
        status: 415,
        body: { error: "There is an error with the image file." },
      };
    }

    const message = err instanceof Error ? err.message : "File processing failed.";
    return { status: 422, body: { error: message } };
  }

  const response: UploadResponse = {
    name: file.name,
    declared_type: file.type,
    size: file.size,
    detected_type: mime,
    detected_ext: ext,
    kind,
    metadata: {},
  };

  try {
    if (kind === "image") {
      Object.assign(response, await buildImageMetadata(file.buffer, mime ?? file.type));
    } else if (kind === "text") {
      Object.assign(response, buildTextMetadata(file.buffer));
    }

    return { status: 200, body: response };
  } catch (err) {
    const message = err instanceof Error ? err.message : "File processing failed.";
    return { status: 422, body: { error: message } };
  }
}
