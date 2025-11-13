import { findIp } from "@arcjet/ip";

// Some Request-like object, such as node's `http.IncomingMessage`, `Request` or
// Next.js' `NextRequest`
const request = new Request("/your-route");

// You can also pass a list of trusted proxies to ignore
const proxyExcludedPublicIp = findIp(request, {
  proxies: [
    "76.76.21.21", // An IP address.
    "103.21.244.0/22", // A CIDR range of IP addresses.
  ],
});
console.log(proxyExcludedPublicIp);
