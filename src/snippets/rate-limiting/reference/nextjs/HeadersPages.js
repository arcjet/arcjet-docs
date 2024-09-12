import arcjet, { fixedWindow } from "@arcjet/next";
import { setRateLimitHeaders } from "@arcjet/decorate";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  setRateLimitHeaders(res, decision);

  if (decision.isDenied()) {
    return res.status(429).json({ error: "Too Many Requests" });
  }

  res.status(200).json({ name: "Hello world" });
}
