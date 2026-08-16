---
type: Feature
title: Extension guidelines
description: Adding routes, UI, and OKF docs safely.
tags: [extension]
timestamp: 2026-08-16T00:00:00Z
---

# Extension guidelines

1. Add API routes under `src/api-server/routes/` and register in `src/api-server/index.ts`.
2. Keep shared contracts in `src/types/`; processing logic in `src/utils/`.
3. Add UI under `src/app/components/`; use `@/` and `@shared/*` path aliases.
4. Session-aware state belongs in `SessionProvider` — avoid prop drilling for file/session actions.
5. Reuse `AppModal` (`src/app/components/ui/app-modal.tsx`) for new dialogs.
6. Document new behavior in `specs/features/` and link from root `index.md`.

Do not add durable persistence without explicit schema and security review — rooms and catalogs are ephemeral by design.
