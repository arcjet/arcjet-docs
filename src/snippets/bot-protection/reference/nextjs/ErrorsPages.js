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

  for (const { reason, state } of decision.results) {
    if (reason.isError()) {
      if (reason.message.includes("requires user-agent header")) {
        // Requests without User-Agent headers can not be identified as any
        // particular bot and will be marked as an errored decision. Most
        // legitimate clients always send this header, so we recommend blocking
        // requests without it.
        // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
        console.warn("User-Agent header is missing");

        if (state !== "DRY_RUN") {
          return res.status(400).json({ error: "Bad request" });
        }
      } else {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //return res.status(503).json({ error: "Service unavailable" });
      }
    }
  }

  if (decision.isDenied()) {
    return res.status(403).json({
      error: "You are a bot!",
    });
  }

  res.status(200).json({ name: "Hello world" });
}
