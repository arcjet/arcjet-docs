/**
 * @import { LoaderFunctionArgs } from "@remix-run/node"
 * @import { ReactNode } from "react"
 */

import arcjet, { filter } from "@arcjet/remix";

// Get your Arcjet key at <https://app.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  characteristics: ['http.request.headers["user-agent"]', "ip.src"],
  key: arcjetKey,
  rules: [
    filter({
      // Use `deny` to deny requests that match expressions and allow others.
      // Use `allow` to allow requests that match expressions and deny others.
      deny: [
        // Match VPN traffic, Tor traffic, basic Curl requests, or requests
        // without user agent.
        'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
      ],
      // Block requests with `LIVE`, use `DRY_RUN` to log only.
      mode: "LIVE",
    }),
  ],
});

/**
 * @returns {ReactNode}
 */
export default function Home() {
  return <>Hello world</>;
}

/**
 * @param {LoaderFunctionArgs} loaderArguments
 * @returns {Promise<undefined>}
 */
export async function loader(loaderArguments) {
  const decision = await aj.protect(loaderArguments);

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403 });
  }
}
