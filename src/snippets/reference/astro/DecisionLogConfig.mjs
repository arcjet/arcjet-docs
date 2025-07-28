// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { fixedWindow, detectBot } from "@arcjet/astro";

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
        fixedWindow({
          mode: "LIVE",
          window: "1h",
          max: 60,
        }),
        detectBot({
          mode: "LIVE",
          allow: [], // "allow none" will block all detected bots
        }),
      ],
    }),
  ],
});
