# Agent & developer instructions — dropafile

**dropafile** — live-session file sharing on **Hono + React** (Cloudflare Workers). Dropzone is always available; optional live sessions let connected peers discover and request files.

## What ships out of the box

| Surface | Route / area | Description |
|---------|----------------|-------------|
| `GET /health` | API | Liveness probe |
| `POST /api/sessions` | API | Create live room |
| `GET /api/sessions/:id/ws` | API | WebSocket presence (Durable Object) |
| `POST /api/upload` | API | File metadata + preview |
| React app | `src/app/` | Dropzone, session share (QR / link), upload history |

Details: [`index.md`](index.md)

## Local development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Update `wrangler.toml` before production deploy.

## Repository documents

[README](README.md) | **INSTRUCTIONS** | [CHANGELOG](CHANGELOG.md) | [CONTRIBUTING](CONTRIBUTING.md) | [SECURITY](SECURITY.md) | [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)
