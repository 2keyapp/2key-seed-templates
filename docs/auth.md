# `auth.json`

Optional first-login people: emails, organization names, a billing email. **You** fill this (your billing contact will help) and **you** open the PR.

**Never put passwords or IdP secrets in this file.** People sign in with the identity provider **we configure** on your billing VM.

Keep `"$schema": "./schemas/auth.schema.json"` at the top.

## Empty (valid — catalog still applies)

```json
{
  "$schema": "./schemas/auth.schema.json",
  "schemaVersion": 1,
  "users": {},
  "organizations": {}
}
```

## Shape

See [`examples/auth/auth.json`](../examples/auth/auth.json). That file is not a real customer.

| You fill | Key | Meaning |
|----------|-----|---------|
| `users` | Email | Person who can sign in. |
| `organizations` | Org slug | Stable handle (not the display name). |
| `members` | Email | Must already appear under `users`. |
| `payingParty` | — | At most one per org. Billing email for that org. |

This does **not** grant complimentary subscriptions. Buying stays in the portal after sign-in.
