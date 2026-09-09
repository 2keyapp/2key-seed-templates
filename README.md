# Your billing catalog

This repository is **your** shop: names, prices, which apps sell which SKUs, optional first-login emails.

You **fork** this template, **you fill** it, **you open pull requests**. Your billing contact will sit with you on the JSON. You do **not** get the billing engine, write SQL, or run apply.

When `main` updates, we get a trigger and apply **this repo** to **your billing VM**. That apply is our job. The catalog is yours.

If you are on [`2keyapp/2key-seed-templates`](https://github.com/2keyapp/2key-seed-templates), `products` is empty on purpose — fork it into your org, then fill.

```
you fork → you fill (we help) → you PR → trigger → we apply on your VM
```

## How you work

1. Fork the template (first time) or use your existing fork.
2. Edit root [`catalog.json`](catalog.json) (and [`auth.json`](auth.json) if you need first-login emails). **[docs/recipes.md](docs/recipes.md)** and **[docs/catalog.md](docs/catalog.md)**. Copy [examples/sample-shop/](examples/sample-shop/) for shape, then **rename every key**.
3. Open a pull request into `main`. CI checks the file. If you added SKUs, run `npm ci && npm run validate` and commit `hosts.json` (your billing contact can do this with you).
4. After merge, we apply when the trigger hits **your** VM. Then check the shop.

## Do not

- Rename a live key (`"pgp"` → something else). That is a new SKU, not a rename.
- Delete a key people still pay for. Hide it: `"isActive": false`.
- Hand-edit `hosts.json` or `schemas/`.
- Put passwords or IdP secrets in git.

[docs/auth.md](docs/auth.md) is the first-login file. [docs/stand-up.md](docs/stand-up.md) and [docs/ci-and-ops.md](docs/ci-and-ops.md) are for **us** (help you fill; apply on trigger). You can ignore them.
