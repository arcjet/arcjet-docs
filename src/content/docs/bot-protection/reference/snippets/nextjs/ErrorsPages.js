import arcjet, { detectBot } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    //return res.status(503).json({ error: "Service unavailable" });
  }

  if (decision.isDenied()) {
    return res.status(403).json({
      error: "You are a bot!",
    });
  }

  res.status(200).json({ name: "Hello world" });
}
