# dropafile

**dropafile** — ephemeral, live-session file sharing on **Cloudflare Workers** (Hono + React). Drop files, spin up a room, and let connected peers see and download what you share in real time. No accounts, no persistent storage.

## How it works

1. **Drop files** on the landing page — the first upload can auto-create a live session, or start/join a room first.
2. **Share** the session link or QR code so others join the same room.
3. **Exchange files** — uploads are announced over WebSocket; owners serve file bytes peer-to-peer while connected.
4. **Leave** when done — files are removed from the room when owners leave or delete them.

Join an existing room from the landing page with **Join session** (paste a link or session code).

## Out-of-the-box features

| Surface | Route / area | Description |
|---------|----------------|-------------|
| API | `GET /health` | Liveness check |
| API | `POST /api/sessions` | Create a live room |
| API | `GET /api/sessions/:id` | Session status |
| API | `GET /api/sessions/:id/ws` | WebSocket room (Durable Object) |
| API | `POST /api/upload` | File classification + metadata |
| App | Landing page | Hero, dropzone, start/join session |
| App | Session panel | QR + link share, multi-file queue, file list |
| App | Session details | Connected peers, host badge, share URL |
| App | `SessionProvider` | Session state, `sessionStorage` catalog for same-tab reload |

Supported upload kinds: PNG, JPEG, plain text, JSON, PDF, ZIP.

## Quick start

```bash
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:5173/health
```

Deploy:

```bash
npm run deploy              # default worker
npm run deploy:staging      # ENVIRONMENT=staging
npm run deploy:production   # ENVIRONMENT=production
```

Copy `.dev.vars.example` to `.dev.vars` for local development.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ENVIRONMENT` | No | `development` (local via `.dev.vars`), `staging`, or `production` (set in `wrangler.toml` env sections) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |

## Project layout

```text
src/
├── api-server/     # Hono Worker, SessionRoom Durable Object
├── app/            # React SPA (SessionProvider, landing, session UI)
├── types/          # Shared contracts
└── utils/          # Classification, formatting
```

## Repository documents

**README** | [INSTRUCTIONS](INSTRUCTIONS.md) | [CHANGELOG](CHANGELOG.md) | [CONTRIBUTING](CONTRIBUTING.md) | [SECURITY](SECURITY.md) | [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)

Maintained by [xarlizard](https://github.com/xarlizard).

## License

MIT
