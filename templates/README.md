# repo-name

**dropafile** — live-session file sharing on **Cloudflare Workers** (Hono + React). Drop files anytime; start a live session so connected peers can see and request what you share.

## Out-of-the-box features

| Surface | Route / area | Description |
|---------|----------------|-------------|
| API | `GET /health` | Liveness check |
| API | `POST /api/sessions` | Create a live room |
| API | `GET /api/sessions/:id/ws` | WebSocket presence |
| API | `POST /api/upload` | File metadata + preview |
| App | Dropzone + session panel | Upload UI, QR / link share, live presence |

## Quick start

```bash
npm install
npm run dev
```

Test health:

```bash
curl http://localhost:5173/health
```

Deploy: `npm run deploy`

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |

Maintained by [author-display-name](https://github.com/author-github-login).

## License

MIT

## Repository documents

**README** | [INSTRUCTIONS](INSTRUCTIONS.md) | [CHANGELOG](CHANGELOG.md) | [CONTRIBUTING](CONTRIBUTING.md) | [SECURITY](SECURITY.md) | [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)
