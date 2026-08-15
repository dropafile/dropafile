import {
  IMAGE_EXTENSIONS,
  TEXT_EXTENSIONS,
} from "./constants";

export const SUPPORTED_FORMATS = [
  {
    kind: "Images",
    extensions: Array.from(IMAGE_EXTENSIONS),
    metadata: "Width and height",
  },
  {
    kind: "Text",
    extensions: Array.from(TEXT_EXTENSIONS),
    metadata: "Character and line count",
  },
  {
    kind: "PDF",
    extensions: ["pdf"],
    metadata: "Metadata only",
  },
  {
    kind: "ZIP",
    extensions: ["zip"],
    metadata: "Metadata only",
  },
] as const;
