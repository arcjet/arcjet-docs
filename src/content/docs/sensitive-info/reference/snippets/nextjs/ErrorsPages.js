import arcjet, { shield } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
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

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    //return res.status(503).json({ error: "Service unavailable" });
  }

  if (decision.isDenied()) {
    return res.status(400).json({
      error: "Unexpected sensitive info received",
    });
  }

  res.status(200).json({ name: "Hello world" });
}
