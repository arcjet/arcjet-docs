import arcjet, { cloudflare } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
  // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
  // the request arrives from a Cloudflare IP range
  proxies: [cloudflare()],
});
