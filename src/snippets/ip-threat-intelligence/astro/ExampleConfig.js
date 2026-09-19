import node from "@astrojs/node";
import arcjet, { filter } from "@arcjet/astro";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  env: { validateSecrets: true },
  integrations: [
    arcjet({
      rules: [
        filter({
          // Deny hosting (data center) IPs, VPNs, proxies, and Tor.
          // This does not deny privacy relays such as Apple Private Relay.
          deny: ["ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor"],
          // Block requests with `LIVE`, use `DRY_RUN` to log only.
          mode: "LIVE",
        }),
      ],
    }),
  ],
});
