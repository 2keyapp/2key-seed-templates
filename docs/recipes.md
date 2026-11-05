# Change the shop (Scomm)

This is **your** [`catalog.json`](../catalog.json). Edit it, open a pull request. Your billing contact will help. You do not run apply — we apply when this fork triggers the **Scomm VM**.

Shop card **titles** are the plan keys below. Search the file for the quoted name.

## Your plan keys

| Shop title | Offering key (do not rename) | Price / year |
|------------|------------------------------|--------------|
| Scomm Desktop | `desktop` | US$10 (required for every other add-on) |
| AI-Assistant | `ai_assistant` | US$10 |
| Post-Quantum E2EE | `pqc` | US$15 |
| Custom Colours & Backgrounds | `accent_color` | US$5 |
| Basic Bundle | `desktop`, `ai_assistant`, `pqc`, `accent_color` | US$25 |

Hidden (`"isActive": false`, kept for existing subscriptions): Scomm Linux / Linux Version (`linux`, counts as `desktop` on older licenses), Local-AI, Outlook OpenPGP ECC (`pgp`), Outlook OpenPGP ECC+PQC, All Add-ons Bundle, and the preview plan Campaign-Manager.

Product key: `"Scomm"`. App: `scommDesktop` (Windows, macOS, Linux). Mobile builds are not licensed. Surface: `scomm` (`office` stays declared for the retired Outlook offering only). Every offering covers up to 3 devices (`maxDevices: 3`). Trial is 30 days on every plan.

IDR is a **separate tenant** (own seed repo, own billing VM, own DB). Do not add IDR packages to this file.

## Change a price

Find the plan, then edit `basePrice`. Leave the plan name and `"annual"` / `"monthly"` keys alone.

```json
"AI-Assistant": {
  "pricings": {
    "annual": { "currency": "USD", "basePrice": 10 }
  }
}
```

Change `10` to the new amount. Keep `"USD"`.

## Change the text customers see

- Plan blurb → `description` on that **plan**
- Add-on label in apps → `displayName` on that **offering** (under `offerings`, not `plans`)

Do not change the quoted **key**.

## Change the portal's look

`theme` in [`storefront.json`](../storefront.json) sets the billing portal's colours, fonts and corners:

- `colors.light` / `colors.dark` — `#rrggbb` per token. `primary` is buttons and links, `sidebar*` the left menu, `backdrop-from` / `backdrop-to` the sign-in page gradient and `backdrop-foreground` the text on it. Tokens you leave out keep the portal default. The full list is in `schemas/storefront.schema.json` (`themePalette`).
- `fonts.body` / `fonts.heading` — a [Google Fonts](https://fonts.google.com) family name, e.g. `"Inter"`.
- `radius` — corner rounding in rem, `0` (square) to `1.5`.
- `appearance` — `"light"`, `"dark"` or `"system"`: what viewers see until they pick with the portal's sun/moon button.

`npm run validate`, then open a PR. Customers see it after the next apply.

## Stop selling

On the plan (or offering) set `"isActive": false`. Do **not** delete the key. If anyone still subscribes, apply will fail.

## Add an add-on or app

You add the keys. Your billing contact will sit with you.

1. Put the offering under `products.Scomm.offerings` (give it `resources.surfaces` that match a host).
2. Put a plan under `plans` with `offeringCodes` pointing at that offering key (or several keys for a bundle).
3. `npm ci && npm run validate` — commit `hosts.json` if it changed.
4. Open a PR.

Field list: [catalog.md](catalog.md). Do not copy [examples/sample-shop/](../examples/sample-shop/) over the live root.

## First-login emails

Root [`auth.json`](auth.md) is yours to change (no passwords). You open the PR.

## Hard rules

| Do not | Why |
|--------|-----|
| Rename a live key | New SKU, not a rename. Add a new key; hide the old one. |
| Delete a key people still pay for | Apply fails. Use `"isActive": false`. |
| Hand-edit `hosts.json` / `schemas/` | Validate writes hosts; we ship schemas. |

A green PR is not in the shop until we apply on the Scomm VM.
