import ip from "@arcjet/ip";

// Some Request-like object, such as node's `http.IncomingMessage`, `Request` or
// Next.js' `NextRequest`
const request = new Request(null);

// You can also pass a list of trusted proxies to ignore
const proxyExcludedPublicIp = ip(request, { proxies: ["103.31.4.0"] });
console.log(proxyExcludedPublicIp);
