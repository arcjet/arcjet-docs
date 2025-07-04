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
      proxies: ["100.100.100.100"],
    }),
  ],
});
