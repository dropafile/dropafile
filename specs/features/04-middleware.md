---
type: Feature
title: Middleware
description: Logger, CORS, and error handling on the Hono app.
tags: [api, middleware]
timestamp: 2026-08-15T00:00:00Z
---

# Middleware

Order in `src/api-server/index.ts`:

1. `logger()`
2. `corsMiddleware` — `ALLOWED_ORIGINS` env
3. `errorHandler` — JSON `{ success: false, error }` on uncaught errors

No authentication middleware in the default template.
