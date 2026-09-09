/**
 * Derive hosts.json from catalog.json host rules.
 * Same rules as billing `deriveHostCatalog`. Apps consume this file; billing-seed apply does not write it.
 *
 * @param {Record<string, unknown>} catalog
 * @returns {{ productNames: string[], hosts: Record<string, { offeringCodes: string[], addonCodes: string[] }> }}
 */
export function deriveHostCatalog(catalog) {
	const products =
		catalog.products != null && typeof catalog.products === "object"
			? catalog.products
			: {};
	const rules =
		catalog.hosts != null && typeof catalog.hosts === "object"
			? catalog.hosts
			: {};
	const hosts = {};

	for (const key of Object.keys(rules)) {
		hosts[key] = { offeringCodes: [], addonCodes: [] };
	}

	const productNames = Object.keys(products);

	for (const product of Object.values(products)) {
		const offerings =
			product != null &&
			typeof product === "object" &&
			product.offerings != null &&
			typeof product.offerings === "object"
				? product.offerings
				: {};

		for (const [offeringCode, offering] of Object.entries(offerings)) {
			if (offering == null || typeof offering !== "object") {
				continue;
			}
			const addon = addonCodeFor(offeringCode, offering);

			for (const [hostKey, rule] of Object.entries(rules)) {
				if (!offeringMatchesHost(offering, rule)) {
					continue;
				}
				const bucket = hosts[hostKey];
				if (bucket == null) {
					continue;
				}
				pushUnique(bucket.offeringCodes, offeringCode);
				pushUnique(bucket.addonCodes, addon);
			}
		}
	}

	return { productNames, hosts };
}

/**
 * @param {string} offeringCode
 * @param {Record<string, unknown>} offering
 * @returns {string}
 */
function addonCodeFor(offeringCode, offering) {
	const resources =
		offering.resources != null && typeof offering.resources === "object"
			? offering.resources
			: {};
	const raw = resources.addonCode;
	if (typeof raw === "string" && raw.trim() !== "") {
		return raw.trim();
	}
	return offeringCode;
}

/**
 * @param {string[]} list
 * @param {string} value
 */
function pushUnique(list, value) {
	if (!list.includes(value)) {
		list.push(value);
	}
}

/**
 * @param {unknown} offeringPlatforms
 * @param {unknown} excludePlatforms
 * @returns {boolean}
 */
function onlyExcludedPlatforms(offeringPlatforms, excludePlatforms) {
	if (!Array.isArray(excludePlatforms) || excludePlatforms.length === 0) {
		return false;
	}
	if (!Array.isArray(offeringPlatforms) || offeringPlatforms.length === 0) {
		return false;
	}
	return offeringPlatforms.every((platform) =>
		excludePlatforms.includes(platform),
	);
}

/**
 * @param {Record<string, unknown>} offering
 * @param {unknown} rule
 * @returns {boolean}
 */
function offeringMatchesHost(offering, rule) {
	if (rule == null || typeof rule !== "object") {
		return false;
	}
	const resources =
		offering.resources != null && typeof offering.resources === "object"
			? offering.resources
			: {};
	const offeringSurfaces = Array.isArray(resources.surfaces)
		? resources.surfaces
		: [];
	const hostSurfaces = Array.isArray(rule.surfaces) ? rule.surfaces : [];
	const hitsSurface = hostSurfaces.some((surface) =>
		offeringSurfaces.includes(surface),
	);
	if (!hitsSurface) {
		return false;
	}
	return !onlyExcludedPlatforms(resources.platforms, rule.excludePlatforms);
}
