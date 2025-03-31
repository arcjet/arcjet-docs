import ip from "@arcjet/ip";

// Some Request-like object, such as node's `http.IncomingMessage`, `Request` or
// Next.js' `NextRequest`
const request = new Request("/your-route");

// Returns the first non-private IP address detected
const publicIp = ip(request);
console.log(publicIp);
