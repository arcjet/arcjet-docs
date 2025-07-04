// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { fixedWindow } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      characteristics: ["ip.src"],
      rules: [
        // This rule is live
        fixedWindow({
          mode: "LIVE",
          window: "1h",
          max: 60,
        }),
        // This rule is in dry run mode, so will log but not block
        fixedWindow({
          mode: "DRY_RUN",
          characteristics: ['http.request.headers["x-api-key"]'],
          window: "1h",
          // max could also be a dynamic value applied after looking up a limit
          // elsewhere e.g. in a database for the authenticated user
          max: 600,
        }),
      ],
    }),
  ],
});
