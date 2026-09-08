# Examples

Copy into the **repo root** `catalog.json` / `auth.json`. Do not treat these folders as the live seed.

| Folder | What to copy | Notes |
|--------|----------------|-------|
| [auth/](auth/) | `auth.json` | Filled bootstrap (emails, org slug, paying party). No passwords. |
| [secmail/](secmail/) | `catalog.json` | Scomm-shaped catalog (rename hosts/products; billing does not require these names). |

`examples/secmail/auth.json` is empty so you can apply the catalog without inventing users. Use `examples/auth/` when you want the identity shape.
