# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-08-16

Evolves the **0.1.0** template baseline into **dropafile** — a standalone live-session file sharing app (`dropafile/dropafile`).

### Added

- Live session rooms via Cloudflare Durable Object (`SessionRoom`) and WebSocket sync
- Landing page with hero, how-it-works, **Start live session**, and **Join session** (link or code)
- Session panel: QR code, copy/share link, compact dropzone, queued multi-file uploads
- Real-time file catalog (`file-added`, `file-removed`, `file-sync`) and P2P download chunks
- Session details modal: share URL, connected peers, host badge, per-user file counts, client hints
- Bulk **Download all** and **Delete all** (owner files only)
- `SessionProvider` context with `sessionStorage` catalog + owned blob recovery on same-tab reload
- Shared `AppModal` shell for metadata, join, and session-details dialogs
- Streamlined app header: icon-only leave, participant count, API status indicator

### Changed

- Rebranded from template scaffold to standalone **dropafile** app
- Upload flow uses sequential queue with progress animation per file
- File rows use ghost cards; metadata opens in shared modal (no auto-open after upload)
- Removed template init scaffolding (`docs/`, `templates/`, init scripts)

### Security

- Ephemeral in-memory catalog on the Durable Object — not persisted to disk
- Files removed when owner leaves, disconnects intentionally, or deletes them
- Session host assigned at room creation; participant attributes from request headers only

## [0.1.0] - 2026-08-15 (template init)

Initialized from [@open-templates/cf-hono-react-file-uploader-template](https://github.com/open-templates/cf-hono-react-file-uploader-template) `v0.1.0` as the fullstack architecture and best-practices boilerplate.

### Added

- **Fullstack Cloudflare Worker** app — **Hono** API + **React** SPA in one repo (`@cloudflare/vite-plugin`, `wrangler deploy`)
- **`GET /health`** — public liveness endpoint; header connectivity indicator in the UI
- **`POST /api/upload`** — multipart upload, in-memory classification, metadata, and ephemeral previews
- **Supported file kinds** — PNG, JPEG, plain text, JSON, PDF, ZIP (`415` for unsupported)
- **Upload handler** — `file-type` + `@jsquash` WASM codecs for Worker-compatible image/text metadata
- **React upload UI** — drag-and-drop dropzone, upload history (latest 10, in-memory), theme toggle
- **Upload metadata dialog** — file kind badge, size, structured metadata list
- **Shared contracts** — `src/types/` (`UploadResponse`, `FileKind`, API envelopes)
- **Shared utilities** — `fileClassifier`, `formatBytes`, `formatKind`, image/text preview helpers
- **API middleware** — request logger, CORS (`ALLOWED_ORIGINS`), centralized error handling
- **Standardized JSON responses** — `{ success, data }` / `{ success: false, error }` via `src/utils/response.ts`
- **OKF bundle** — root `index.md`, `specs/features/`, `.agents/skills/`
- **Repository scaffolding** — Dependabot, CODEOWNERS placeholders, issue/PR templates, standard markdown docs (`README`, `INSTRUCTIONS`, `CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`)
- **Template init wizard** — `./scripts/init-from-template.sh` to personalize repo metadata from `templates/`

---

## Repository documents

[README](README.md) | [INSTRUCTIONS](INSTRUCTIONS.md) | **CHANGELOG** | [CONTRIBUTING](CONTRIBUTING.md) | [SECURITY](SECURITY.md) | [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)
