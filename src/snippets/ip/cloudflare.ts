import ip, { cloudflare } from "@arcjet/ip";

// Some Request-like object, such as node's `http.IncomingMessage`, `Request` or
// Next.js' `NextRequest`
const request = new Request("/your-route");

// Pass the `cloudflare()` proxy service to read the real client IP from
// Cloudflare's `CF-Connecting-IP` header, but only when the request comes from
// a known Cloudflare IP range
const publicIp = ip(request, {
  proxies: [cloudflare()],
});
console.log(publicIp);
