# cf-hono-react-file-uploader-template

Fullstack **Cloudflare Worker** app from [@open-templates](https://github.com/open-templates): **Hono** API + **React** SPA in one repo. Upload a file to inspect metadata and ephemeral previews (images, text, PDF, ZIP) — nothing is persisted.

## Quick start

1. **Use this template** on GitHub, then clone your repo.
2. Personalize from `templates/`:

```bash
./scripts/init-from-template.sh
```

3. Install and run:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

See [`templates/ABOUT_TEMPLATES.md`](templates/ABOUT_TEMPLATES.md) and [`docs/INIT_TEMPLATE.md`](docs/INIT_TEMPLATE.md).

## Out-of-the-box features

| Surface | Route / area | Description |
|---------|----------------|-------------|
| API | `GET /health` | Liveness check (header indicator in UI) |
| API | `POST /api/upload` | Classify file, return metadata + preview |
| App | Upload + history | Drag-and-drop UI, in-memory history (latest 10) |

See [`index.md`](index.md) for architecture and extension guidance.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite + Worker (local fullstack) |
| `npm run build` | Production client + Worker bundle |
| `npm run deploy` | Build and `wrangler deploy` |
| `npm run typecheck` | TypeScript |
| `npm run init` | Copy `templates/` → root (after fork) |

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins (only if calling API from another origin) |

## License

MIT

## Repository documents

**README** | [INSTRUCTIONS](INSTRUCTIONS.md) | [CHANGELOG](CHANGELOG.md) | [CONTRIBUTING](CONTRIBUTING.md) | [SECURITY](SECURITY.md) | [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)
