import arcjet, { sensitiveInfo } from "@arcjet/node";
import { defaultRecognizers, rampart } from "@arcjet/sensitive-info-rampart";
import http from "node:http";
import { text } from "node:stream/consumers";

// A recognizer receives the full text and returns the spans it matched. This
// one reports IBANs as bank account numbers.
function detectIban(value) {
  const spans = [];
  for (const match of value.matchAll(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g)) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "BANK_ACCOUNT",
    });
  }
  return spans;
}

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://console.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL", "BANK_ACCOUNT"],
      mode: "LIVE",
      backend: rampart({
        // Keep the default recognizers and add your own.
        recognizers: [...defaultRecognizers, detectIban],
      }),
    }),
  ],
});

const server = http.createServer(async function (req, res) {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: await text(req),
  });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isRateLimit()) {
      console.log("Rate limit rule", result);
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
