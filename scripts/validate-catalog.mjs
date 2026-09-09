#!/usr/bin/env node
/**
 * Structural JSON Schema check for catalog.json / auth.json, then write hosts.json.
 * Semantic rules (offeringCodes, currencies, live SKUs) run in billing-seed.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { deriveHostCatalog } from "./derive-hosts.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const HOSTS_PATH = "hosts.json";

/**
 * @param {string} relativePath
 * @returns {unknown}
 */
function loadJson(relativePath) {
	const absolute = resolve(ROOT, relativePath);
	return JSON.parse(readFileSync(absolute, "utf8"));
}

/**
 * @param {import("ajv").ValidateFunction} validate
 * @param {string} relativePath
 * @returns {boolean}
 */
function checkFile(validate, relativePath) {
	const absolute = resolve(ROOT, relativePath);
	if (!existsSync(absolute)) {
		process.stderr.write(`missing ${relativePath}\n`);
		return false;
	}
	const ok = validate(loadJson(relativePath));
	if (ok) {
		process.stdout.write(`${relativePath} ok\n`);
		return true;
	}
	process.stderr.write(`${relativePath} failed JSON Schema validation\n`);
	process.stderr.write(`${JSON.stringify(validate.errors, null, 2)}\n`);
	return false;
}

function writeHostsJson() {
	const catalog = loadJson("catalog.json");
	if (catalog == null || typeof catalog !== "object") {
		process.stderr.write("catalog.json is not an object\n");
		return false;
	}
	const slice = deriveHostCatalog(
		/** @type {Record<string, unknown>} */ (catalog),
	);
	writeFileSync(resolve(ROOT, HOSTS_PATH), `${JSON.stringify(slice, null, "\t")}\n`);
	process.stdout.write(`${HOSTS_PATH} written\n`);
	return true;
}

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const catalogValidate = ajv.compile(loadJson("schemas/catalog.schema.json"));
const authValidate = ajv.compile(loadJson("schemas/auth.schema.json"));

const catalogFiles = ["catalog.json", "examples/sample-shop/catalog.json"];
const authFiles = [
	"auth.json",
	"examples/auth/auth.json",
	"examples/sample-shop/auth.json",
];

let failed = false;
for (const file of catalogFiles) {
	if (!checkFile(catalogValidate, file)) {
		failed = true;
	}
}
for (const file of authFiles) {
	if (!checkFile(authValidate, file)) {
		failed = true;
	}
}

if (!failed && !writeHostsJson()) {
	failed = true;
}

if (failed) {
	process.exitCode = 1;
}
