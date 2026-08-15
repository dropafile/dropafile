# API server

Hono app compiled for Cloudflare Workers. Handles health checks and upload processing. Static assets from the React build are served via Wrangler; `/api/*` and `/health` are routed to the Worker first.

# Entry & middleware

* [index.ts](index.ts) - Worker entry; mounts logger, CORS, error handler, `/health`, and `/api`.
* [middleware/index.ts](middleware/index.ts) - CORS configuration and global error-to-JSON handling.

# Routes

* [routes/health.ts](routes/health.ts) - `GET /health`.
* [routes/upload.ts](routes/upload.ts) - `POST /api/upload`; parses multipart form data.

# Processing

* [uploadHandler.ts](uploadHandler.ts) - Classifies the file, builds previews via shared utils, and returns typed JSON responses.
