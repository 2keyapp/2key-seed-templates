# Filling `catalog.json`

`catalog.json` is the commercial source of truth for this billing VM. Billing assigns Postgres ids at apply time. Do not put `id` fields in this file.

Keep `"$schema": "./schemas/catalog.schema.json"` at the top so the editor uses the checked-in schema.

## Skeleton

```json
{
  "$schema": "./schemas/catalog.schema.json",
  "schemaVersion": 1,
  "billingEngineTag": "optional-pin-to-a-billing-release",
  "surfaces": ["web", "desktop"],
  "platforms": ["linux"],
  "hosts": {
    "web": { "surfaces": ["web"] },
    "desktop": { "surfaces": ["desktop"], "excludePlatforms": ["linux"] }
  },
  "products": {
    "ExampleProduct": {
      "description": "What this product is",
      "isActive": true,
      "offerings": {
        "basic": {
          "displayName": "Basic",
          "resources": {
            "addonCode": "basic",
            "surfaces": ["web", "desktop"]
          }
        },
        "linux_build": {
          "displayName": "Linux build",
          "resources": {
            "addonCode": "linux_build",
            "surfaces": ["desktop"],
            "platforms": ["linux"]
          }
        }
      },
      "plans": {
        "Basic annual": {
          "offeringCodes": ["basic"],
          "pricings": {
            "annual": { "currency": "USD", "basePrice": 10 }
          }
        }
      }
    }
  }
}
```

Surface strings (`web`, `desktop`) and host keys (`web`, `desktop`) are **yours**. Billing does not ship `secmail` / `office` / `secmailDesktop`. The SecMail example exists only under `examples/secmail/`.

## Top-level fields

| Field | Required | Meaning |
|-------|----------|---------|
| `schemaVersion` | Yes | JSON contract version. Currently `1`. Not a Postgres version. |
| `billingEngineTag` | No | Pin to the billing release whose schema you copied. |
| `surfaces` | If offerings/hosts use surfaces | Vocabulary for `resources.surfaces` and host `surfaces`. |
| `platforms` | If any offering or host uses platforms | Vocabulary for `resources.platforms` and `excludePlatforms`. |
| `hosts` | Recommended | Named using-party binaries and how they match offerings. |
| `products` | Yes | Map of product name → body. Empty `{}` is valid JSON, empty shop. |

## Maps (object key = unique name)

| Path | Key | Body |
|------|-----|------|
| `hosts` | Host name you choose | `{ "surfaces": [...], "excludePlatforms": [...] }` |
| `products` | Product name (shop / JWT identity) | description, isActive, meters, offerings, plans |
| `products.*.meters` | Meter key | displayName, unit, aggregation (`sum` \| `max` \| `last`) |
| `products.*.offerings` | Offering code | displayName, isActive, resources |
| `products.*.plans` | Plan name | description, trialDays, isActive, offeringCodes, pricings |
| `products.*.plans.*.pricings` | Interval (`annual`, `monthly`, `quarterly`, …) | `{ "currency", "basePrice", "isActive?" }` |

This version allows **one currency per interval** (for example `pricings.annual.currency` is `"USD"`). Multi-currency on the same interval is not in schema v1.

`currency` must exist in the billing database’s shared seed (USD, EUR, …). AJV does not know your DB; `billing-seed` does.

## Offerings and resources

| Field | Meaning |
|-------|---------|
| `resources.surfaces` | Which using-party surfaces this SKU belongs to (must be in catalog `surfaces`). |
| `resources.platforms` | Optional extra scope (must be in catalog `platforms`). |
| `resources.addonCode` | Code hosts use to gate the add-on. Defaults to the offering key if omitted. |
| `resources.maxDevices` | Optional device cap. |
| `resources.usageGrants` | Optional `{ "<meterKey>": { "quantity": n } }`. |

Every string in a plan’s `offeringCodes` must be a key on **that product’s** `offerings`. AJV will not catch a typo here; billing-seed will.

## Hosts (derived catalog, not a second price list)

You name hosts. You do **not** list offering codes by hand. After apply, billing writes a slice:

```json
{
  "productNames": ["ExampleProduct"],
  "hosts": {
    "web": { "offeringCodes": ["basic"], "addonCodes": ["basic"] }
  }
}
```

An offering is included on a host when:

1. It shares at least one surface with `hosts.<name>.surfaces`, and
2. It is **not** limited to `excludePlatforms` (every offering platform is in that exclude list — typical for “Linux-only SKU, skip the desktop host”).

Derived output has **no prices** and **no Postgres ids**. Apps bake names and codes only.

Worked Scomm hosts: `examples/secmail/catalog.json` (`secmailDesktop` excludes `linux`, `office` excludes `linux`, `secmailLinux` does not).

## Changing a live catalog

| Intent | What to do |
|--------|------------|
| New SKU | Add a new object key. Re-apply upserts. |
| Rename display text | Change `displayName` / `description`. The **key** is the stable identity. |
| Stop selling | `"isActive": false` on the offering or plan. |
| Change price | Edit `basePrice`. Existing subscriptions are a billing concern, not a JSON delete. |
| Remove a SKU that still has seats | **Do not omit the key.** Apply will fail closed. |

Renaming a **key** (`"pgp"` → `"openpgp"`) is a new SKU plus an old one. Treat it as a migration, not a rename.

## `schemaVersion` vs `billingEngineTag`

- `schemaVersion` — this JSON shape (`1`).
- `billingEngineTag` — optional string you set when you copy a new `schemas/` from billing so ops knows which engine the file was written for.

When billing publishes a new contract, someone with both repos runs `npm run catalog-seed:schema` in billing (copies into `schemas/` if this repo is a sibling), then you pull/rebase the template and re-validate.
