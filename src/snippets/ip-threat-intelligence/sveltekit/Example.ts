import { env } from "$env/dynamic/private";
import arcjet, { filter } from "@arcjet/sveltekit";
import { type RequestEvent, error } from "@sveltejs/kit";

interface HandleProperties {
  event: RequestEvent;
  resolve: Resolve;
}

type Resolve = (event: RequestEvent) => Promise<Response> | Response;

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

export async function handle(properties: HandleProperties): Promise<Response> {
  const decision = await aj.protect(properties.event);

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return properties.resolve(properties.event);
}
