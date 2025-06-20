// @ts-check
import { defineConfig } from "astro/config";
// @ts-expect-error
import node from "@astrojs/node";
import arcjet, { shield } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [
        // Protect against common attacks with Arcjet Shield
        shield({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        }),
      ],
    }),
  ],
});
