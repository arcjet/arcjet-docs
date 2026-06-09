import { arcjet as arcjetNuxt, cloudflare } from "#arcjet";

export const arcjet = arcjetNuxt({
  rules: [],
  // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
  // the request arrives from a Cloudflare IP range
  proxies: [cloudflare()],
});
