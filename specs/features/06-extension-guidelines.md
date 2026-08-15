---
type: Feature
title: Extension guidelines
description: Adding routes, UI, and OKF docs safely.
tags: [extension]
timestamp: 2026-08-15T00:00:00Z
---

# Extension guidelines

1. Add API routes under `src/api-server/routes/` and register in `src/api-server/index.ts`.
2. Keep shared contracts in `src/types/`; processing logic in `src/utils/`.
3. Add UI under `src/app/components/`; use `@/` and `@shared/*` path aliases.
4. Document new behavior in `specs/features/` and link from root `index.md`.
5. Add `.agents/skills/modules/` entries for non-obvious patterns.

Do not add persistence without explicit schema and security review — the default template is ephemeral by design.
