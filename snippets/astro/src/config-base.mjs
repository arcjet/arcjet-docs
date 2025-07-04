// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet from "@arcjet/astro";

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    // We recommend enabling secret validation
    validateSecrets: true,
  },
  integrations: [
    // Add the Arcjet Astro integration
    arcjet(),
  ],
});
