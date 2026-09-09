# Help them fill; apply on trigger (internal)

**Audience: us.** They never get the billing engine.

They **fork**, **fill**, and **raise their own PRs**. We sit with them on the JSON. We do **not** own their catalog, merge their PRs, or treat an empty shop as our failure to “hand them a filled fork.”

**Our ops job is one thing:** when we get `catalog-seed-updated` for **that** `catalog_repo`, apply that SHA on **that tenant’s billing VM**.

```
they fork 2keyapp/2key-seed-templates
they fill + PR (we help)
merge to main → dispatch { sha, ref, catalog_repo }
we apply that commit on the VM wired to that fork
```

Canonical blank: [`2keyapp/2key-seed-templates`](https://github.com/2keyapp/2key-seed-templates). Empty `products` is the starting point of **their** fork.

## Once per tenant VM (wire the trigger)

1. They fork the template into their GitHub org.
2. On **their** fork we set `DOWNSTREAM_DISPATCH_TOKEN` and `DOWNSTREAM_REPO` so push to `main` dispatches **our** ops. Canonical `2keyapp/2key-seed-templates` must **not** dispatch.
3. Ops maps `catalog_repo` → **that VM** (not a table in the billing engine). Staging and production are different VMs; each gets its own mapping (and usually its own fork or branch policy — their git, our apply target).
4. Enable currencies they will price (usually `USD`). Configure IdP on that billing. They still fill `auth.json` if they want first-login emails.

## Sitting with them (support, not our PR)

- [examples/sample-shop/](../examples/sample-shop/) is shape only. **They** rename every key. Leftover `SecMail` / `secmailDesktop` must not land on their `main`.
- `npm ci && npm run validate`; they commit `hosts.json` on their PR.
- Recipes: [recipes.md](recipes.md). Field list: [catalog.md](catalog.md).
- We do not take over the PR. If CI is red, we help them fix **their** branch.

## On trigger (apply)

Checkout `catalog_repo` at `sha`. Against **that VM’s** DB:

```bash
billing-seed validate --dir .
billing-seed apply --dir .
```

See [ci-and-ops.md](ci-and-ops.md). If apply fails (unknown currency, omitted live SKU), that is a catalog/VM mismatch — we tell them; we do not silently rewrite their JSON.

## Do not

- Fill and merge the catalog as if it were ours
- Apply a fork onto the wrong VM
- Give them the billing engine, Stripe keys, or SQL
- Dispatch from the canonical empty template
