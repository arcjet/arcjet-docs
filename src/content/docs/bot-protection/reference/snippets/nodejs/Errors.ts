import arcjet, { detectBot } from "@arcjet/node";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

const server = http.createServer(async function (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  const decision = await aj.protect(req);

  // If the request is missing a User-Agent header, the decision will be
  // marked as an error! You should check for this and make a decision about
  // the request since requests without a User-Agent could indicate a crafted
  // request from an automated client.
  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here if the request is missing a User-Agent
    //res.writeHead(503, { "Content-Type": "application/json" });
    //res.end(JSON.stringify({ error: "Service unavailable" }));
  }

  if (decision.isDenied()) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello world" }));
  }
});

server.listen(8000);
