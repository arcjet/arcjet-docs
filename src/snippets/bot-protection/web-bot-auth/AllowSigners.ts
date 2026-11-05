import arcjet, { detectBot } from "@arcjet/node";
import { isSpoofedBot, isVerifiedBot } from "@arcjet/inspect";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Deny every detected bot except search engines and two signed agents
      allow: ["CATEGORY:SEARCH_ENGINE", "CHATGPT_AGENT", "GOOGLE_AGENT"],
    }),
  ],
});

const server = http.createServer(async (req, res) => {
  const decision = await aj.protect(req);

  if (decision.isDenied() || decision.results.some(isSpoofedBot)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
    return;
  }

  if (decision.results.some(isVerifiedBot)) {
    // A crawler or signed agent that this rule allows by name
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello world" }));
});

server.listen(3000);
