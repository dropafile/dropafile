---
type: Feature
title: Fullstack runtime
description: Vite, Cloudflare Vite plugin, Worker + SPA assets.
tags: [docker, deployment, vite, wrangler]
timestamp: 2026-08-15T00:00:00Z
---

# Fullstack runtime

```text
npm run dev  →  Vite + @cloudflare/vite-plugin (Worker + React)
npm run build  →  dist/client (SPA) + Worker bundle
npm run deploy  →  wrangler deploy
```

```text
src/
├── api-server/   # Hono Worker
├── app/          # React SPA
├── types/        # Shared contracts
└── utils/        # Shared + Worker processing
```

`wrangler.toml`: `run_worker_first` for `/api/*` and `/health`; SPA fallback via `[assets]`.
