# React app

TypeScript SPA built with Vite, React 19, and Tailwind. The dropzone POSTs files to `/api/upload`; successful uploads open a metadata dialog with ephemeral previews. Metadata for the latest 10 uploads is kept in memory only.

# Entry

* [main.tsx](main.tsx) - Client bootstrap, theme provider, and toast host.
* [App.tsx](App.tsx) - Page layout, upload card, supported formats, history, and dialog state.

# API clients

* [api/uploadClient.ts](api/uploadClient.ts) - Browser helper for `POST /api/upload`.
* [api/health.ts](api/health.ts) - Client helper for `GET /health`.

# Components

* [components/Dropzone.tsx](components/Dropzone.tsx) - Drag-and-drop zone and file picker.
* [components/UploadMetadataDialog.tsx](components/UploadMetadataDialog.tsx) - Modal for metadata and one-time previews.
* [components/UploadHistoryList.tsx](components/UploadHistoryList.tsx) - Clickable list of the latest 10 uploads (metadata only).
* [components/MetadataList.tsx](components/MetadataList.tsx) - Metadata definition list used inside dialogs.
* [components/theme-provider.tsx](components/theme-provider.tsx) - Light/dark/system theme context.
* [components/theme-toggle.tsx](components/theme-toggle.tsx) - Theme switch control.
* [components/ui/button.tsx](components/ui/button.tsx) - Button primitive.
* [components/ui/card.tsx](components/ui/card.tsx) - Card primitive.

# Layout

* [layout/AppLayout.tsx](layout/AppLayout.tsx) - Page shell with header and main content area.
* [layout/AppHeader.tsx](layout/AppHeader.tsx) - Header with branding, API health dot, and theme toggle.

# Hooks

* [hooks/use-api-health.ts](hooks/use-api-health.ts) - Polls `/health` for online/offline status.
* [hooks/use-upload-history.ts](hooks/use-upload-history.ts) - In-memory FIFO history capped at 10 entries.

# Client-only types & helpers

* [types/upload-ui.ts](types/upload-ui.ts) - `UploadMetadata`, `UploadHistoryEntry`, and history limit.
* [lib/upload-metadata.ts](lib/upload-metadata.ts) - Strips ephemeral previews before storing history.
* [lib/utils.ts](lib/utils.ts) - `cn()` Tailwind class merge helper.

# Styles

* [styles/globals.css](styles/globals.css) - Tailwind imports and theme CSS variables.
