// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/astro";
import { baseUrl } from "@arcjet/env";

const client = createRemoteClient({
  // baseUrl defaults to https://decide.arcjet.com and should only be changed if
  // directed by Arcjet. It can also be set via the ARCJET_BASE_URL environment
  // variable.
  baseUrl: baseUrl(process.env),
  // timeout is the maximum time to wait for a response from the server. It
  // defaults to 1000ms when NODE_ENV or ARCJET_ENV is "development" and 500ms
  // otherwise. This is a conservative limit to fail open by default. In most
  // cases, the response time will be <20-30ms.
  timeout: 500,
});

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
        slidingWindow({
          mode: "LIVE",
          interval: "1h",
          max: 60,
        }),
      ],
      client,
    }),
  ],
});
