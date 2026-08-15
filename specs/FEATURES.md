# Features (contract)

| Feature | API / UI | Auth |
|---------|----------|------|
| Health | `GET /health` | Public |
| Upload | `POST /api/upload` | Public (in-memory processing) |
| File uploader UI | React `src/app/` | Public |

Supported kinds: image (PNG/JPEG), text (txt/json), PDF, ZIP. Unsupported → `415`.

See numbered specs under `specs/features/`.
