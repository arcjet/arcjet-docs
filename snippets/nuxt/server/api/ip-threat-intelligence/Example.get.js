// @ts-expect-error
// The `#arcjet` virtual module is created when using `@arcjet/nuxt`.
import arcjetNuxt, { filter } from "#arcjet";

const arcjet = arcjetNuxt({
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

export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event);

  if (decision.isDenied()) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return { message: "Hello world" };
});
