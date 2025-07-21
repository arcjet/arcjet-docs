import arcjet, { sensitiveInfo, shield } from "@arcjet/node";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
    shield({
      mode: "LIVE",
    }),
  ],
});

const server = http.createServer(async function (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  const decision = await aj.protect(req);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }

    if (result.reason.isShield()) {
      console.log("Shield protection rule", result);
    }
  }

  if (decision.isDenied()) {
    if (decision.reason.isSensitiveInfo()) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Unexpected sensitive info detected",
          reason: decision.reason,
        }),
      );
      res.end(JSON.stringify({ error: "Forbidden" }));
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    }
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello world" }));
  }
});

server.listen(8000);
