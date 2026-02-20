// @ts-check
import arcjet, { slidingWindow } from "@arcjet/astro";
import node from "@astrojs/node";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  env: { validateSecrets: true },
  integrations: [
    arcjet({
      // To illustrate, allow 3 requests per minute per IP address.
      rules: [slidingWindow({ interval: 60, max: 3, mode: "LIVE" })],
      // @ts-expect-error: TODO does not yet exist.
      // Assumes requests will have an `x-my-ip` header that you trust:
      trustedIpHeader: "x-my-ip",
    }),
  ],
});
