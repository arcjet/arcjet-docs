import node from "@astrojs/node";
import arcjet, { filter } from "@arcjet/astro";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  env: { validateSecrets: true },
  integrations: [
    arcjet({
      characteristics: ['http.request.headers["user-agent"]', "ip.src"],
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
    }),
  ],
});
