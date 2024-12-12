import ip from "@arcjet/ip";

// Some Request-like object, such as node's `http.IncomingMessage`, `Request` or
// Next.js' `NextRequest`
const request = new Request(null);

// Also optionally takes a platform for additional protection
const platformGuardedPublicIp = ip(request, { platform: "fly-io" });
console.log(platformGuardedPublicIp);
