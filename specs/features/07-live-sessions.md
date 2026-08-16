---
type: Feature
title: Live sessions
description: Room creation, WebSocket sync, P2P file transfer, and session UI.
tags: [websocket, durable-objects, sessions, p2p]
timestamp: 2026-08-16T00:00:00Z
---

# Live sessions

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/sessions` | Create room; optional `hostClientId` in JSON body |
| `GET` | `/api/sessions/:id` | Participant count / alive |
| `GET` | `/api/sessions/:id/ws?clientId=` | WebSocket upgrade to `SessionRoom` DO |

## WebSocket messages (client ↔ room)

| Type | Direction | Purpose |
|------|-----------|---------|
| `presence` | server → all | Connected count |
| `participants` | server → all | Peers, host, file counts, client attributes |
| `file-sync` | server → client | Full catalog on connect |
| `file-added` | client → peers | Announce shared file metadata |
| `file-removed` | server → all | Remove from catalog |
| `file-remove` | owner → server | Request removal |
| `file-request` / `file-data` | peers | Chunked P2P download |
| `owner-leaving` | client → server | Explicit leave; clears owner files |
| `peer-joined` | server → peers | Trigger re-offer of owned files |

## Client architecture

- **`SessionProvider`** (`src/app/contexts/session-context.tsx`) — WebSocket lifecycle, file catalog, uploads, downloads.
- **`session-file-store`** — `sessionStorage` catalog + owned blob snapshots for same-tab reload.
- **Reload** — unmount closes WS with reconnect reason; server keeps catalog; client hydrates and re-offers.

## UI

- **Landing** — start session, join session (modal), dropzone with upload queue.
- **Session panel** — session details / delete all / download all; QR; file list with owner remove.
- **Session details** — share URL, participants, host badge, device hints from request headers.

Handler: `src/api-server/session-room.ts` · Client: `src/app/contexts/session-context.tsx`.
