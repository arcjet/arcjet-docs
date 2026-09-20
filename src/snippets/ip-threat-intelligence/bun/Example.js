import arcjet, { filter } from "@arcjet/bun";
import { env } from "bun";

// Get your Arcjet key at <https://console.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  key: arcjetKey,
  rules: [
    filter({
      // Deny hosting (data center) IPs, VPNs, proxies, and Tor.
      // This does not deny privacy relays such as Apple Private Relay.
      deny: ["ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor"],
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
