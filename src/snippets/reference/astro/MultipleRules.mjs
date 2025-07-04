// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { detectBot, tokenBucket } from "@arcjet/astro";

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
        tokenBucket({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
          refillRate: 5, // refill 5 tokens per interval
          interval: 10, // refill every 10 seconds
          capacity: 10, // bucket maximum capacity of 10 tokens
        }),
        detectBot({
          mode: "LIVE",
          allow: [], // "allow none" will block all detected bots
        }),
      ],
    }),
  ],
});
