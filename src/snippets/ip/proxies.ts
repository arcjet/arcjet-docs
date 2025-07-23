import ip from "@arcjet/ip";

// Some Request-like object, such as node's `http.IncomingMessage`, `Request` or
// Next.js' `NextRequest`
const request = new Request("/your-route");

// You can also pass a list of trusted proxies to ignore
const proxyExcludedPublicIp = ip(request, {
  proxies: [
    "100.100.100.100", // A single IP
    "100.100.100.0/24", // A CIDR for the range
  ],
});
console.log(proxyExcludedPublicIp);
