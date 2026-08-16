# Features (contract)

| Feature | API / UI | Auth |
|---------|----------|------|
| Health | `GET /health` | Public |
| Upload | `POST /api/upload` | Public (in-memory processing) |
| Live sessions | `POST /api/sessions`, `GET …/ws` | Public (ephemeral DO room) |
| Landing + session UI | React `src/app/` | Public |
| Join session | `JoinSessionDialog` | Public |

Supported upload kinds: image (PNG/JPEG), text (txt/json), PDF, ZIP. Unsupported → `415`.

See numbered specs under `specs/features/`.
