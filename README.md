# billing-seed-template

This repo is the **commercial catalog** for **one** billing deployment (one process, one Postgres). You fork it, fill JSON, and push. CI checks the JSON shape here, then tells **your** ops repo to apply it to **your** billing database.

You do **not** write SQL. You do **not** put any PIIs here.

```
you  →  this fork (catalog.json)  →  your ops repo  →  your billing VM
              AJV shape check           billing-seed validate + apply
```

`examples/auth/` is the filled identity bootstrap. `examples/secmail/` is a worked Scomm catalog. Billing does not require those product names, host names, or surface tokens. Copy the **shape**, not the brand.

## Who this is for

| Role               | What you do here                                                   |
| ------------------ | ------------------------------------------------------------------ |
| Merchant / product | Name products, SKUs, prices, which apps sell them                  |
| Merchant ops       | Fork, wire GitHub secrets, keep `main` applying to the right VM    |
| Billing engine     | Already owns `billing-seed`. You do not clone billing to edit JSON |

One fork → one VM. Billing has no tenant directory. If you have staging and production, use two forks (or two branches plus two downstream jobs — ops chooses).

## First hour

1. **Fork** this repository (keep the fork relationship so you can pull schema updates).
2. Install **Node 20+**, then from the repo root:

   ```bash
   npm ci
   npm run validate
   ```

   The empty root files should pass. That only means the JSON is well-formed, not that you have a shop yet.

3. Copy starting files:

   ```bash
   cp examples/auth/auth.json auth.json
   cp examples/secmail/catalog.json catalog.json
   ```

   Or keep the empty root files and fill them using [docs/auth.md](docs/auth.md) and [docs/catalog.md](docs/catalog.md). Rename products, hosts, emails, and surface strings to **your** tenant.

4. Run `npm run validate` again. Open a PR; GitHub Actions runs the same check.

5. On the fork, set dispatch secrets ([docs/ci-and-ops.md](docs/ci-and-ops.md)). After that, a merge to `main` applies the catalog on your billing VM.

Editors: keep the `"$schema"` line at the top of `catalog.json` / `auth.json` so VS Code / Cursor can underline mistakes while you type.

## What lives where

| Path                                 | You edit?                                                    | Purpose                                             |
| ------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------- |
| `catalog.json`                       | Yes                                                          | Products, offerings, plans, prices, hosts           |
| `auth.json`                          | Optional                                                     | Bootstrap emails / org slugs. **No passwords.**     |
| `schemas/`                           | No                                                           | JSON Schema copied from billing. Do not hand-edit.  |
| `examples/auth/`                     | No (reference)                                               | Filled `auth.json` (emails, org slug, paying party) |
| `examples/secmail/`                  | No (reference)                                               | Lead-approved Scomm-shaped catalog                  |
| `scripts/validate-catalog.mjs`       | No                                                           | AJV check used by `npm run validate`                |
| `.github/workflows/catalog-seed.yml` | Only if your GitHub path is not `2key/billing-seed-template` | Validate on PR; dispatch on `main` (forks only)     |

## Rules that save you from a failed apply

- **Keys are names.** `"SecMail"` is the product. `"pgp"` is the offering. Duplicate keys are invalid JSON — that is the uniqueness check.
- **Lists stay arrays.** `surfaces`, `platforms`, and plan `offeringCodes` are string arrays, not objects.
- **Declare vocabulary first.** Every surface/platform you use on an offering or host must appear in the top-level `surfaces` / `platforms` arrays.
- **Hide, don’t delete.** To stop selling a SKU, set `"isActive": false`. If you **omit** a product/offering/plan that still has live subscriptions or seats, **billing-seed apply fails**.
- **Re-apply is safe.** The same JSON upserts; ids stay in Postgres. Apps should use **names and codes**, not serial ids.
- **AJV** `npm run validate` will not catch a plan that points at a missing offering, a currency missing from the billing DB, or a live SKU you deleted from JSON. Those fail in `billing-seed`.

Full field reference: [docs/catalog.md](docs/catalog.md). Identities: [docs/auth.md](docs/auth.md). CI and ops: [docs/ci-and-ops.md](docs/ci-and-ops.md).

## Local check vs billing apply

| Where      | Command                              | Catches                                                    |
| ---------- | ------------------------------------ | ---------------------------------------------------------- |
| This repo  | `npm run validate`                   | Wrong types, missing required fields, extra top-level keys |
| Billing VM | `billing-seed validate` then `apply` | Offering codes, currencies, live-row deletes, host derive  |

You cannot finish onboarding from this repo alone. Ops must run `billing-seed` against the database (see [docs/ci-and-ops.md](docs/ci-and-ops.md)).

## What this repo is not

- Stripe / PayPal keys, Connect, or webhook secrets
- Shop copy, screenshots, or app binaries
- A list of VMs inside billing
- A license to delete catalog rows that customers still use
