import arcjet, { cloudflare } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
  // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
  // the request arrives from a Cloudflare IP range
  proxies: [cloudflare()],
});
