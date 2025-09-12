import arcjet, { filter } from "@arcjet/node";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    filter({
      allow: [
        // Requests matching this expression will be allowed. All other
        // requests will be denied.
        'not ip.src.vpn and ip.src.country eq "US" and http.request.method eq "GET"',
      ],
      mode: "LIVE",
    }),
  ],
});

const server = http.createServer(async function (req, res) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello world" }));
});

server.listen(8000);
