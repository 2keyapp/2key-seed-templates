# Filling `auth.json`

Optional. Use it to bootstrap **emails and org slugs** into Better Auth + a paying party on first apply. Skip the file or leave empty objects if users already exist.

**Never put passwords, OAuth client secrets, or session tokens in this file.** People sign in through the IdP / invite flow.

Keep `"$schema": "./schemas/auth.schema.json"` at the top.

## Empty (valid)

```json
{
  "$schema": "./schemas/auth.schema.json",
  "schemaVersion": 1,
  "users": {},
  "organizations": {}
}
```

Catalog apply still runs.

## Filled example

Checked in at [`examples/auth/auth.json`](../examples/auth/auth.json):

```json
{
  "$schema": "./schemas/auth.schema.json",
  "schemaVersion": 1,
  "users": {
    "ops@example.com": {
      "name": "Ops",
      "emailVerified": true
    }
  },
  "organizations": {
    "example-org": {
      "name": "Example Org",
      "members": {
        "ops@example.com": { "role": "owner" }
      },
      "payingParty": {
        "billingEmail": "billing@example.com"
      }
    }
  }
}
```

Replace the emails and slug before you apply. See also [examples/auth/README.md](../examples/auth/README.md).

## Keys

| Path | Key | Notes |
|------|-----|--------|
| `users` | Email | Normalized `lower(trim)` on apply. |
| `organizations` | Org slug | Stable handle, not the display `name`. |
| `organizations.*.members` | Email | Must exist under `users`. |
| `payingParty` | (object, not a list) | At most one per org. Creates `paying_parties` after the org exists. |

## Rules

| Topic | Behavior |
|-------|----------|
| Upsert | User on email; org on slug; member on `(org, user)`. |
| Delete | Do not remove a user or org that still has live subscriptions. |
| Apps | Do **not** bake `auth.json` into Email/Office. It is PII-ish bootstrap only. |
| Passwords | Not in git. Ever. |

`examples/secmail/auth.json` is empty so the catalog example can apply without a user directory. For a filled bootstrap, copy [`examples/auth/auth.json`](../auth/auth.json).
