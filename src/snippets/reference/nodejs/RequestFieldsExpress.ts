import arcjet, { fixedWindow, shield } from "@arcjet/node";
import express from "express";
import { readBody } from "@arcjet/body";

const app = express();
const port = 3000;

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY!,
  // Limiting by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
    // Fixed window rate limit. Arcjet also supports sliding window and token
    // bucket.
    fixedWindow({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      window: "1m", // 1 min fixed window
      max: 1, // allow a single request (for demo purposes)
    }),
  ],
});

app.get("/", async (req, res) => {
  // If you are using standard Express, you can just pass req directly to
  // protect(). If you want to do something custom, you can construct an object
  // with the necessary details, such as the following:
  const details = {
    ip: req.ip,
    method: req.method,
    host: req.hostname,
    url: req.path,
    headers: req.headers,
  };

  const decision = await aj.protect(details);

  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello World" }));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
