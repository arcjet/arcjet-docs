import ip, { cloudflare } from "@arcjet/ip";

const request = new Request("/your-route");

// Override the bundled Cloudflare ranges with your own list. This *replaces*
// the bundled ranges, so include the full list from https://www.cloudflare.com/ips/
// plus any new range Cloudflare has added that the SDK doesn't know about yet.
const publicIp = ip(request, {
  proxies: [
    cloudflare({
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
console.log(publicIp);
