import {
  IMAGE_EXTENSIONS,
  TEXT_EXTENSIONS,
} from "./constants";

export const SUPPORTED_FORMATS = [
  {
    kind: "Images",
    extensions: Array.from(IMAGE_EXTENSIONS),
    preview: "Thumbnail (max 200×200)",
  },
  {
    kind: "Text",
    extensions: Array.from(TEXT_EXTENSIONS),
    preview: "Text snippet",
  },
  {
    kind: "PDF",
    extensions: ["pdf"],
    preview: "Metadata only",
  },
  {
    kind: "ZIP",
    extensions: ["zip"],
    preview: "Metadata only",
  },
] as const;
