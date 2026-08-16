# Agent & developer instructions — dropafile

**dropafile** — live-session file sharing on **Hono + React** (Cloudflare Workers). Peers join a room, share files in real time, and download while owners stay connected. No database; room state is ephemeral.

## UX flow

| Step | User action | System behavior |
|------|-------------|-----------------|
| 1 | Drop file(s) on landing | Files queue; first upload may create a session silently |
| 2 | **Start live session** or **Join session** | Room created or joined; URL becomes `/s/:id` |
| 3 | Share QR / link | Peers open same session; WebSocket connects |
| 4 | Upload in session | Each file uploads, animates, then `file-added` broadcasts to peers |
| 5 | Download / remove | P2P fetch from owner; remove syncs via `file-removed` |
| 6 | **Leave session** | Owner files cleared for all peers; `sessionStorage` wiped |

**Reload:** same-tab refresh keeps owned file catalog in `sessionStorage` and reconnects without wiping the room catalog.

## What ships out of the box

| Surface | Route / area | Description |
|---------|----------------|-------------|
| `GET /health` | API | Liveness probe |
| `POST /api/sessions` | API | Create live room (`hostClientId` in body) |
| `GET /api/sessions/:id` | API | Room status |
| `GET /api/sessions/:id/ws` | API | WebSocket room (Durable Object) |
| `POST /api/upload` | API | File metadata + classification |
| React app | `src/app/` | Landing, session panel, `SessionProvider` |

Details: [`index.md`](index.md) · Feature specs: [`specs/`](specs/)

## Key modules

| Area | Path |
|------|------|
| Session context | `src/app/contexts/session-context.tsx` |
| Session room DO | `src/api-server/session-room.ts` |
| Session file store | `src/app/lib/session-file-store.ts` |
| Upload queue | `src/app/hooks/use-file-upload.ts` |
| Shared modal | `src/app/components/ui/app-modal.tsx` |

## Local development

```bash
npm install
npm run dev
npm run typecheck
```

## Deploy

```bash
npm run deploy              # default worker (no ENVIRONMENT var — treated as development)
npm run deploy:staging      # wrangler --env staging
npm run deploy:production   # wrangler --env production
```

Copy `.dev.vars.example` to `.dev.vars` for local dev (`ENVIRONMENT=development`).

Update `wrangler.toml` routes and worker `name` before production deploy.

## Repository documents

[README](README.md) | **INSTRUCTIONS** | [CHANGELOG](CHANGELOG.md) | [CONTRIBUTING](CONTRIBUTING.md) | [SECURITY](SECURITY.md) | [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)
