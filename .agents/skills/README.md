# dropafile — Agent Skills Index

OKF module guides and Cursor skill packs for this repository.

## OKF layers

| Layer | Path |
|-------|------|
| Feature contracts | [`index.md`](../../index.md) (repo root) |
| OKF skills index | [`index.md`](index.md) |
| Shared concepts | [`shared/`](shared/) |
| Local modules | [`modules/`](modules/) |

## Shared concepts

Optional references for future stack additions:

* [auth/shared/](shared/auth/) — session, JWT, route guards
* [supabase/shared/](shared/supabase/) — OAuth setup, worker clients

## Cursor SKILL.md packs

None shipped by default. Add `.agents/skills/<pack>/SKILL.md` when you adopt a stack, then list it here.

## Extension order

1. Read **`INSTRUCTIONS.md`** and **`index.md`**
2. Review **`specs/features/07-live-sessions.md`** for session architecture
3. Add application code under `src/`
4. Document features in `specs/features/` and link from root `index.md`
5. Add `.agents/skills/modules/` guides for non-obvious patterns
