---
okf_version: "0.1"
---

# dropafile

OKF knowledge bundle for live-session file sharing on Cloudflare Workers.

## Documentation

* [README.md](README.md) - quick start, UX flow, and scripts
* [INSTRUCTIONS.md](INSTRUCTIONS.md) - maintainer and agent guide

## Features

* [01 — Purpose](specs/features/01-purpose.md) - goals and architecture
* [02 — Health endpoint](specs/features/02-health-endpoint.md) - `GET /health`
* [03 — Upload endpoint](specs/features/03-upload-endpoint.md) - `POST /api/upload`
* [04 — Middleware](specs/features/04-middleware.md) - logger, CORS, errors
* [05 — Fullstack runtime](specs/features/05-fullstack-runtime.md) - Vite + Worker + SPA assets
* [06 — Extension guidelines](specs/features/06-extension-guidelines.md) - new routes and UI
* [07 — Live sessions](specs/features/07-live-sessions.md) - rooms, WebSocket, P2P sync

## Skills

* [.agents/skills/index.md](.agents/skills/index.md) — OKF modules
* [.agents/skills/README.md](.agents/skills/README.md) — Cursor `SKILL.md` catalog
