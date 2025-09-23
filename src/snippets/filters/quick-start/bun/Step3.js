import arcjet, { filter } from "@arcjet/bun";
import { env } from "bun";

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

export default {
  fetch: aj.handler(async function (request) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
  port: 3000,
};
