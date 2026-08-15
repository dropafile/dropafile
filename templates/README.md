# repo-name

Fullstack **Cloudflare Worker** file uploader: **Hono** API + **React** SPA. Upload files to inspect metadata and ephemeral previews — nothing is stored server-side.

## Out-of-the-box features

| Surface | Route / area | Description |
|---------|----------------|-------------|
| API | `GET /health` | Liveness check |
| API | `POST /api/upload` | Classify file, metadata + preview |
| App | Upload UI | Drag-and-drop, theme toggle, upload history |

See [`index.md`](index.md) for architecture and extension guidance.

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
