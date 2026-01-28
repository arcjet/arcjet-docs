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
        // @ts-expect-error: TODO does not yet exist.
        // Assumes `cloudflare` are the Cloudflare IP ranges from
        // <https://docs.arcjet.com/concepts/client-ip#ip-ranges>.
        Object.fromEntries(cloudflare.map((d) => [d, "cf-connecting-ip"])),
      ],
      rules: [],
    }),
  ],
});
