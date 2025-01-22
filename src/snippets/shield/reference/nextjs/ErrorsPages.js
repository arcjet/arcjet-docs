import arcjet, { shield } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return res.status(503).json({ error: "Service unavailable" });
    }
  }

  if (decision.isDenied()) {
    return res.status(403).json({
      error: "You are suspicious!",
    });
  }

  res.status(200).json({ name: "Hello world" });
}
