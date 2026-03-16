import arcjet, { detectBot } from "@arcjet/node";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // deny all bots by default, including signals failures
    }),
  ],
});

const server = http.createServer(async (req, res) => {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "success" }));
});

server.listen(3000);
