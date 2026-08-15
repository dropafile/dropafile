# Utilities

Shared helpers imported by the Worker upload handler and, where relevant, the React UI via `@shared/utils/*`.

* [constants.ts](constants.ts) - MIME type sets and text snippet length constant.
* [extension.ts](extension.ts) - Extracts a lowercase extension from a filename.
* [fileClassifier.ts](fileClassifier.ts) - Detects file kind from buffer content and declared type.
* [formatBytes.ts](formatBytes.ts) - Human-readable byte size formatter.
* [formatKind.ts](formatKind.ts) - Maps `FileKind` values to display labels.
* [supportedFormats.ts](supportedFormats.ts) - Supported file types list for the UI.
* [bytes.ts](bytes.ts) - Base64 encoding helper for inline image previews.
* [response.ts](response.ts) - Standard API success/error response builders for Hono.
* [imageCodecs.ts](imageCodecs.ts) - `@jsquash` WASM init and PNG/JPEG decode/encode helpers (Worker-safe).
* [imagePreview.ts](imagePreview.ts) - Generates a 200×200 thumbnail and image metadata.
* [textPreview.ts](textPreview.ts) - Extracts character count, line count, and a text snippet.
