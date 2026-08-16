---
type: Feature
title: Health endpoint
description: Public liveness check for the UI header indicator.
tags: [api, health]
timestamp: 2026-08-15T00:00:00Z
---

# Health endpoint

`GET /health` — no authentication.

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "environment": "development",
    "timestamp": "2026-08-15T12:00:00.000Z"
  }
}
```

Implemented in `src/api-server/routes/health.ts`. Polled by `src/app/hooks/use-api-health.ts`.
