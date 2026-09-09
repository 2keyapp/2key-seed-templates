# Platform ops (internal)

**Audience: us.** Tenants fork, fill, and PR ([README](../README.md), [recipes](recipes.md)). Help-them-fill + VM mapping: [stand-up.md](stand-up.md).

**Our job:** on `catalog-seed-updated`, apply **that** `catalog_repo` @ `sha` to **that tenant’s VM**. We do not own their catalog git.

Canonical template `2keyapp/2key-seed-templates` **does not dispatch**.

## What their CI does

`.github/workflows/catalog-seed.yml`:

1. **Every PR and push** — `npm ci && npm run validate`.
2. **Push to `main` on their fork** — `repository_dispatch` to **our** ops:

   ```json
   {
     "event_type": "catalog-seed-updated",
     "client_payload": {
       "sha": "<commit>",
       "ref": "<git ref>",
       "catalog_repo": "<github owner/name of this fork>"
     }
   }
   ```

Ops **must** apply that payload only on the VM wired to `catalog_repo`.

## Secrets (we set on **their** fork, so their merge can trigger us)

| Name | Type | Value |
|------|------|--------|
| `DOWNSTREAM_DISPATCH_TOKEN` | Repository **secret** | Token that can `POST /repos/<ops>/dispatches` |
| `DOWNSTREAM_REPO` | Actions **variable** | Our ops repo `owner/name` |

Validate still runs if these are missing; dispatch fails. Until the handler is live, a billing engineer may apply that SHA by hand on the **correct** VM — still their JSON, still that VM.

## Apply (the only seed task on the VM)

```bash
billing-seed validate --dir .
billing-seed apply --dir .
```

`auth.json` is used when the file exists. Apply updates Postgres. Apps consume their committed `hosts.json`.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `npm run validate` extra property | Typo or a field not in format v1. Help them on **their** PR. |
| Apply unknown offering | Plan `offeringCodes` is not a key on that product’s offerings. |
| Apply unknown currency | Currency not enabled on **that** VM. |
| Apply refuses to drop a SKU | They omitted a key that still has live subscriptions/seats. `"isActive": false`. |
| Dispatch skipped | Canonical template, or the event is a pull_request. |
| Shop empty | Their `products` is still `{}`, or we have not applied **this** fork to **this** VM. |
| Wrong catalog in the shop | Trigger was applied to the wrong VM. |

## Catalog format updates

Do not hand-edit `schemas/`. From **billing**: `npm run catalog-seed:schema`, then they pull schema updates into **their** fork (we help).
