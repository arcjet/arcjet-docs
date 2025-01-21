import arcjet, { slidingWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 60,
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  for (const ruleResult of decision.results) {
    if (ruleResult.reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", ruleResult.reason.message);
      // You could also fail closed here for very sensitive routes
      //return res.status(503).json({ error: "Service unavailable" });
    }
  }

  if (decision.isDenied()) {
    return res.status(429).json({ error: "Too Many Requests" });
  }

  res.status(200).json({ name: "Hello world" });
}
