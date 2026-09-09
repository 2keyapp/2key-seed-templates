# Sample catalog (email + office)

Shape sample for **your** fork. Sample names (`SecMail`, `secmailDesktop`) must **not** stay as the live catalog — rename every key.

| File | What it shows |
|------|----------------|
| `catalog.json` | Two surfaces, a Linux-only SKU, three apps (hosts), one product, annual USD plans |
| `auth.json` | Empty (catalog only) |

Copy to repo root, then rename. First-login shape: [../auth/auth.json](../auth/auth.json). Your billing contact will sit with you. You open the PR.

Host derive in this sample:

- `office` — Outlook-style SKUs (`pgp`, `pqc`, `ai_assistant`); not Linux-only
- `secmailDesktop` — email SKUs except Linux-only
- `secmailLinux` — email SKUs including `linux`

Recipes: [docs/recipes.md](../../docs/recipes.md).
