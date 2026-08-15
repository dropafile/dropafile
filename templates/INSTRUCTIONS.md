# Agent & developer instructions — repo-name

Fullstack **Hono + React** Cloudflare Worker file uploader. Upload files to inspect metadata and previews in memory.

## What ships out of the box

| Surface | Route / area | Description |
|---------|----------------|-------------|
| `GET /health` | API | Liveness probe |
| `POST /api/upload` | API | File metadata + preview |
| React app | `src/app/` | Upload UI and history |

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
