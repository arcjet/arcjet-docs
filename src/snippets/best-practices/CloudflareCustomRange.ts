import arcjet, { cloudflare } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
  proxies: [
    cloudflare({
      // This *replaces* the ranges bundled with the SDK, so include the full
      // list from https://www.cloudflare.com/ips/ plus any new range
      ranges: [
        // The current Cloudflare ranges...
        "173.245.48.0/20",
        "103.21.244.0/22",
        // ...plus a new range not yet bundled in the SDK
        "203.0.113.0/24",
      ],
    }),
  ],
});
