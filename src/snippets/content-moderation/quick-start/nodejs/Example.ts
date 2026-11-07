import { launchArcjet, moderateContent } from "@arcjet/guard";
import http from "node:http";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end();
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const { message } = JSON.parse(Buffer.concat(chunks).toString()) as {
    message: string;
  };

  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(message)],
  });

  // Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
  // complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
  // decision.warnings for longer text. To moderate all of it, split it up.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Harmful content detected – rephrase your message",
      }),
    );
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(8000);
