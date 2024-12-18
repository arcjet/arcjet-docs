import arcjet, { detectBot } from "@arcjet/node";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

const server = http.createServer(async function (req, res) {
  const decision = await aj.protect(req);

  if (decision.isErrored()) {
    if (decision.reason.message.includes("requires user-agent header")) {
      // Requests without User-Agent headers can not be identified as any
      // particular bot and will be marked as an errored decision. Most
      // legitimate clients always send this header, so we recommend blocking
      // requests without it.
      // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
      console.warn("User-Agent header is missing");
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bad request" }));
    } else {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", decision.reason.message);
      // You could also fail closed here for very sensitive routes
      //res.writeHead(503, { "Content-Type": "application/json" });
      //res.end(JSON.stringify({ error: "Service unavailable" }));
    }
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
