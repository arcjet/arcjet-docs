/**
 * @import { RequestEvent } from '@sveltejs/kit';
 */

/**
 * @typedef HandleProperties
 * @property {RequestEvent} event
 * @property {Resolve} resolve
 */

/**
 * @callback Resolve
 * @param {RequestEvent} event
 * @returns {Promise<Response> | Response}
 */

import { env } from "$env/dynamic/private";
import arcjet, { filter } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

// Get your Arcjet key at <https://app.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  characteristics: ['http.request.headers["user-agent"]', "ip.src"],
  key: arcjetKey,
  rules: [
    filter({
      // This will deny any traffic using a VPN, Tor, that matches the curl
      // user agent, or that has no user agent
      deny: [
        'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
      ],
      // Block requests with `LIVE`, use `DRY_RUN` to log only.
      mode: "LIVE",
    }),
  ],
});

/**
 * @param {HandleProperties} properties
 * @returns {Promise<Response>}
 */
export async function handle(properties) {
  const decision = await aj.protect(properties.event);

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return properties.resolve(properties.event);
}
