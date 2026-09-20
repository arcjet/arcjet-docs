import http from "node:http";
import arcjet, { filter } from "@arcjet/node";

// Get your Arcjet key at <https://console.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  key: arcjetKey,
  rules: [
    filter({
      // Deny hosting (data center) IPs, VPNs, proxies, and Tor.
      // This does not deny privacy relays such as Apple Private Relay.
      deny: ["ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor"],
      // Block requests with `LIVE`, use `DRY_RUN` to log only.
      mode: "LIVE",
    }),
  ],
});

const server = http.createServer(async function (request, response) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  response.writeHead(200);
  response.end("Hello world");
});

server.listen(3000);
