import http from "node:http";
import { text } from "node:stream/consumers";
import arcjet, { sensitiveInfo } from "@arcjet/node";
import { rampart } from "@arcjet/sensitive-info-rampart";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com
  // and set it as an environment variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // Detect names and email addresses. See the reference for the full list.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME"],
      // Use the on-device Rampart NER model instead of the built-in engine.
      backend: rampart(),
    }),
  ],
});

const server = http.createServer(async function (req, res) {
  const message = await text(req);

  const decision = await aj.protect(req, {
    sensitiveInfoValue: message,
  });
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Bad request - sensitive information detected" }),
    );
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello world" }));
  }
});

server.listen(8000);
