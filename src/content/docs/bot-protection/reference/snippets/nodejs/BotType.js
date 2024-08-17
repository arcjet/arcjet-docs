import arcjet, { detectBot } from "@arcjet/node";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      block: ["AUTOMATED", "LIKELY_AUTOMATED"],
    }),
  ],
});

const server = http.createServer(async function (req, res) {
  const decision = await aj.protect(req);
  console.log("Arcjet decision", decision);

  if (decision.isDenied() && decision.reason.isBot()) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Forbidden",
        // Useful for debugging, but don't return these to the client in
        // production
        botType: decision.reason.botType,
        botScore: decision.reason.botScore,
        ipHosting: decision.reason.ipHosting,
        ipVpn: decision.reason.ipVpn,
        ipProxy: decision.reason.ipProxy,
        ipTor: decision.reason.ipTor,
        ipRelay: decision.reason.ipRelay,
        userAgentMatch: decision.reason.ipRelay,
      }),
    );
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello world" }));
  }
});

server.listen(8000);
