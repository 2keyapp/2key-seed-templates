# SecMail example

This folder is a **worked Scomm catalog**, not a required tenant. Billing does not know the names `SecMail`, `secmailDesktop`, or `office`.

| File | What it shows |
|------|----------------|
| `catalog.json` | Surfaces `secmail` / `office`, platform `linux`, three hosts, one product with four offerings and annual USD plans |
| `auth.json` | Empty bootstrap (catalog-only apply) |

Copy `catalog.json` to the repo root and rename keys to match **your** product. For identity bootstrap, copy [../auth/auth.json](../auth/auth.json) instead of this empty `auth.json`. Host derive in this example:

- `office` — Outlook SKUs (`pgp`, `pqc`, `ai_assistant`); not `linux`
- `secmailDesktop` — Email SKUs except Linux-only
- `secmailLinux` — Email SKUs including `linux`

See [docs/catalog.md](../../docs/catalog.md) for the generic rules.
