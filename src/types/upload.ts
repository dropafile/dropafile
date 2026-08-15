export type FileKind = "text" | "image" | "pdf" | "zip" | "unsupported";

export type UploadResponse = {
  name: string;
  declared_type: string;
  size: number;
  detected_type: string | null;
  detected_ext: string | null;
  kind: FileKind;
  metadata: Record<string, string | number | null>;
  preview?: {
    image?: string;
    text?: string;
  };
};

export type UploadErrorResponse = {
  error: string;
};
