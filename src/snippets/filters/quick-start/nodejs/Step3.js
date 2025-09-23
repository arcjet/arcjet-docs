import http from "node:http";
import arcjet, { filter } from "@arcjet/node";

// Get your Arcjet key at <https://app.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const aj = arcjet({
  characteristics: ['http.request.headers["user-agent"]', "ip.src"],
  key: arcjetKey,
  rules: [
    filter({
      // This will deny any traffic using a VPN, Tor, that matches the curl
      // user agent, or that has no user agent
      deny: [
        'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
      ],
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
