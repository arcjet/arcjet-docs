import arcjet, { fixedWindow } from "@arcjet/node";
import http from "node:http";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  // Define a custom userId characteristic.
  // See https://docs.arcjet.com/rate-limiting/configuration#characteristics
  characteristics: ["userId"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

const server = http.createServer(async function (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  // Pass userId as a string to identify the user. This could also be a number
  // or boolean value
  const decision = await aj.protect(req, { userId: "user123" });
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Too Many Requests", reason: decision.reason }),
    );
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello world" }));
});

server.listen(8000);
