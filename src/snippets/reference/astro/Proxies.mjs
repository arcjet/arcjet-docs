// @ts-check
import arcjet from "@arcjet/astro";
import node from "@astrojs/node";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  env: { validateSecrets: true },
  integrations: [
    arcjet({
      proxies: [
        "76.76.21.21", // An IP address.
        "103.21.244.0/22", // A CIDR range of IP addresses.
      ],
      rules: [],
    }),
  ],
});
