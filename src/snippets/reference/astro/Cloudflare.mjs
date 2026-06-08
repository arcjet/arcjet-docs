// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { cloudflare } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [],
      // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
      // the request arrives from a Cloudflare IP range
      proxies: [cloudflare()],
    }),
  ],
});
