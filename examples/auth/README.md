# Auth bootstrap example

Filled `auth.json` matching the billing contract: user keyed by **email**, org keyed by **slug**, member email must exist under `users`, at most one `payingParty` per org.

This is **not** a real customer. Replace emails and slugs before you apply. **No passwords.**

Copy to the repo root when you want identity bootstrap:

```bash
cp examples/auth/auth.json auth.json
```

Leave root `auth.json` empty (or omit users/orgs) if identities already exist. Catalog-only apply still works.

Next example: [../secmail/](../secmail/) — Scomm-shaped `catalog.json`.
