# CI and ops (fork → billing VM)

This repo only proves the JSON is **shaped** correctly. Applying it to Postgres happens in **your** ops/billing pipeline.

## What the workflow does

`.github/workflows/catalog-seed.yml`:

1. **Every PR and every push** — `npm ci && npm run validate` (AJV).
2. **Push to `main` on a fork** — `repository_dispatch` to your ops repo with:

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

The canonical template (`2key/billing-seed-template`) **does not dispatch**. If you publish the master under another GitHub path, change the `if:` in that workflow to match **your** canonical repo, or every push to master will try to dispatch.

## Secrets on the fork (required for apply)

On the **fork** (not the canonical template):

| Name | Type | Value |
|------|------|--------|
| `DOWNSTREAM_DISPATCH_TOKEN` | Repository **secret** | PAT (or GitHub App token) that can `POST /repos/<ops>/dispatches` |
| `DOWNSTREAM_REPO` | Actions **variable** | `myorg/billing-ops` (owner/name, no `https://`) |

If either is missing, the dispatch job fails with a short message. Validate still runs.

Token scopes: `repo` on the ops repository (or the fine-grained equivalent for “create repository dispatch”).

## Downstream job (ops repo)

Ops already knows **this** merchant’s billing VM. Billing does not. A typical job:

```yaml
name: Apply catalog seed
on:
  repository_dispatch:
    types: [catalog-seed-updated]

jobs:
  apply:
    runs-on: ubuntu-latest
    steps:
      - name: Check out seed repo at dispatched SHA
        uses: actions/checkout@v4
        with:
          repository: ${{ github.event.client_payload.catalog_repo }}
          ref: ${{ github.event.client_payload.sha }}
          token: ${{ secrets.SEED_REPO_READ_TOKEN }}

      # How you invoke billing-seed depends on your deploy (image, SSH, working tree).
      # The contract is the same:
      - name: Validate (billing)
        run: |
          billing-seed validate --catalog catalog.json --auth auth.json

      - name: Apply
        run: |
          billing-seed apply --catalog catalog.json --auth auth.json --hosts-out hosts.json
```

From a billing working tree the equivalent npm scripts are:

```bash
npm run billing-seed -- validate --catalog /path/to/catalog.json --auth /path/to/auth.json
npm run billing-seed -- apply --catalog /path/to/catalog.json --auth /path/to/auth.json --hosts-out hosts.json
```

`--auth` is optional if you are not bootstrapping identities.

After apply:

- Catalog rows are upserted in **that** database.
- `hosts.json` is the derived host slice (product names + offering/addon codes, no prices). Bake that into using-party apps; do not copy `pricings`.

## Checklist before the first production apply

- [ ] `npm run validate` is green on the fork
- [ ] `catalog.json` has your product keys (not leftover `SecMail` unless you are Scomm)
- [ ] Currencies you priced (`USD`, …) exist on the VM (`ddp seed` / shared reference data already applied)
- [ ] Fork secrets `DOWNSTREAM_DISPATCH_TOKEN` and `DOWNSTREAM_REPO` are set
- [ ] Ops repo handles `catalog-seed-updated` and can reach the billing DB
- [ ] You have a plan for `hosts.json` (artifact, follow-on app pipeline)

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `npm run validate` extra property | Typo at the top level, or a field not in schema v1. |
| Validate passes, apply says unknown offering | `offeringCodes` value is not a key on that product’s `offerings`. |
| Apply says unknown currency | Currency not in shared billing seed. |
| Apply refuses to drop a SKU | You omitted a key that still has live subscriptions/seats. Set `isActive: false` instead. |
| Dispatch job skipped | You are on the canonical template repo, or the event is a pull_request. |
| Dispatch job: set secret… | Fork is missing `DOWNSTREAM_DISPATCH_TOKEN` or `DOWNSTREAM_REPO`. |
| AJV green, shop empty | Root `products` is still `{}`. Fill `catalog.json`. |

## Syncing schemas from billing

Do not edit `schemas/*.json` by hand.

When billing changes the JSON contract, in the **billing** repo run `npm run catalog-seed:schema`. If this template is a sibling (`../billing-seed-template`), that command copies the files here. Then rebase/pull the template (or cherry-pick `schemas/`) and run `npm run validate` again. Set `billingEngineTag` in `catalog.json` if you need to record which engine you pinned.
