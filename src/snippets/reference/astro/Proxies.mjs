// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet from "@arcjet/astro";

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
      proxies: [
        "203.0.113.100", // A single IP
        "203.0.113.0/24", // A CIDR for the range
      ],
    }),
  ],
});
