# Change the shop

This is **your** `catalog.json`. Edit it, open a pull request. Your billing contact will help with the JSON. You do not run apply — we apply when your fork triggers **your** VM.

The shop card **title** is the plan **key** (the quoted name under `plans`). Search the file for that title.

## Change a price

Find the plan, then edit `basePrice`. Leave the plan name and `"annual"` / `"monthly"` keys alone.

```json
"Linux Version": {
  "pricings": {
    "annual": { "currency": "USD", "basePrice": 5 }
  }
}
```

Change `5` to the new amount. Currency stays what we enabled on your billing (usually `USD`).

## Change the text customers see

- Plan blurb → `description` on that **plan**
- Add-on label in apps → `displayName` on that **offering** (under `offerings`, not `plans`)

Do not change the quoted **key**.

## Stop selling

On the plan (or offering) set `"isActive": false`. Do **not** delete the key. If anyone still subscribes, apply will fail.

## Add an add-on or app

You add the keys. Your billing contact will sit with you.

1. Put the offering under `products.<YourProduct>.offerings` (give it `resources.surfaces` that match a host).
2. Put a plan under `plans` with `offeringCodes` pointing at that offering key.
3. `npm ci && npm run validate` — commit `hosts.json` if it changed.
4. Open a PR.

Shape to copy: [examples/sample-shop/catalog.json](../examples/sample-shop/catalog.json). Rename every key. Field list: [catalog.md](catalog.md).

## First-login emails

Optional [`auth.json`](auth.md). **No passwords.** Your billing contact will help. You still open the PR.

## Hard rules

| Do not | Why |
|--------|-----|
| Rename a live key | New SKU, not a rename. Add a new key; hide the old one. |
| Delete a key people still pay for | Apply fails. Use `"isActive": false`. |
| Hand-edit `hosts.json` / `schemas/` | Validate writes hosts; we ship schemas. |

A green PR is not in the shop until we apply on your VM.
