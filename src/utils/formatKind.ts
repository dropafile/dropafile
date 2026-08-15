import type { FileKind } from "@shared/types/upload";

const KIND_LABELS: Record<Exclude<FileKind, "unsupported">, string> = {
  text: "Text",
  image: "Image",
  pdf: "PDF",
  zip: "ZIP",
};

export function formatKind(kind: FileKind): string {
  return KIND_LABELS[kind as keyof typeof KIND_LABELS] ?? kind;
}
