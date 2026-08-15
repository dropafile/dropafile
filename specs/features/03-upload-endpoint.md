---
type: Feature
title: Upload endpoint
description: Multipart upload, classification, metadata, and previews.
tags: [api, upload, files]
timestamp: 2026-08-15T00:00:00Z
---

# Upload endpoint

`POST /api/upload` — `multipart/form-data` field `file`.

## Success (`200`)

`UploadResponse` from `src/types/upload.ts`: name, declared/detected types, kind, metadata, optional preview (image data URL or text snippet).

## Errors

| Status | When |
|--------|------|
| `400` | No file |
| `415` | Unsupported type or image classification error |
| `422` | Processing failure |

Handler: `src/api-server/uploadHandler.ts` · Route: `src/api-server/routes/upload.ts`.
