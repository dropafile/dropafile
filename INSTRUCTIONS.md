# Agent & developer instructions — cf-hono-react-file-uploader-template

Use this file when turning this template into a **production fullstack app** on Cloudflare Workers (Hono API + React SPA in one repository).

## Two layers

| Location | Purpose |
|----------|---------|
| **Root** (hosted template) | Public face with `@open-templates` branding until adopters run init |
| **`templates/`** | Adopter files with `owner-username`, `repo-name`, and related placeholders |

`./scripts/init-from-template.sh` copies `templates/` → root and removes `scripts/` when finished. See [`docs/INIT_TEMPLATE.md`](docs/INIT_TEMPLATE.md).

### Included automation

| Asset | Role |
|-------|------|
| `.github/dependabot.yml` | npm + GitHub Actions dependency PRs |
| `.github/workflows/dependabot-signature.yml` | Amends Dependabot commits with `Co-authored-by` |
| `.github/CODEOWNERS` | Default review ownership |

Add CI (build, typecheck, deploy) when you customize the project.

## What ships out of the box

| Surface | Route / area | Description |
|---------|----------------|-------------|
| `GET /health` | API | Liveness check |
| `POST /api/upload` | API | File classification, metadata, previews |
| React app | `src/app/` | Upload UI, theme toggle, in-memory history |

Details: [`index.md`](index.md)

## Architecture

```text
Browser → Vite dev / Worker assets
         → Hono Worker (src/api-server)
         → Shared types/utils (src/types, src/utils)
         → React SPA (src/app)
```

- **No database** — uploads are processed in memory; previews are ephemeral.
- **Image previews** — `@jsquash` WASM codecs (Worker-compatible).

## Local development

```bash
npm install
npm run dev
```

Verify:

```bash
curl http://localhost:5173/health
```

## Deploy

```bash
npm run build
npm run deploy
```

Configure `wrangler.toml` `name` and routes before production. See Cloudflare docs for custom domains and secrets.

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `ALLOWED_ORIGINS` | No | CORS; only needed for cross-origin API calls |

## After “Use this template”

1. Run `./scripts/init-from-template.sh` (see [`docs/INIT_TEMPLATE.md`](docs/INIT_TEMPLATE.md)).
2. Review `git diff`, commit personalized files.
3. Extend via [`specs/features/06-extension-guidelines.md`](specs/features/06-extension-guidelines.md).

## Agent read order

1. **INSTRUCTIONS.md** (this file)
2. **index.md** — OKF feature index
3. **.agents/skills/index.md** — module guides
4. **specs/FEATURES.md** — feature contract

## Repository documents

[README](README.md) | **INSTRUCTIONS** | [CHANGELOG](CHANGELOG.md) | [CONTRIBUTING](CONTRIBUTING.md) | [SECURITY](SECURITY.md) | [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)
