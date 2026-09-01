/**
 * Reo.Dev client ID shared intentionally by the marketing site, Console, and
 * docs — one Reo workspace tracks all three surfaces.
 *
 * Cookie categories: https://docs.reo.dev/reo.dev-javascript-cookies-and-consent-guide
 */
export const REO_CLIENT_ID = "1e8a6033a509691";

export const REO_SCRIPT_ORIGIN = "https://static.reo.dev";

/** Allowed in CSP `connect-src`; Reo's SDK calls this origin directly after init. */
export const REO_API_ORIGIN = "https://api.reo.dev";

export const REO_SCRIPT_SRC = `${REO_SCRIPT_ORIGIN}/${REO_CLIENT_ID}/reo.js`;
