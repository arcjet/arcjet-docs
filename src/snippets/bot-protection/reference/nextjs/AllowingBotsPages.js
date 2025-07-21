import arcjet, { detectBot } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list - all other detected bots will be blocked
      allow: [
        // Google has multiple crawlers, each with a different user-agent, so we
        // allow the entire Google category
        "CATEGORY:GOOGLE",
        "CURL", // allows the default user-agent of the `curl` tool
        "DISCORD_CRAWLER", // allows Discordbot
      ],
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    // Bots not in the allow list will be blocked
    if (decision.reason.isBot()) {
      return res.status(403).json({
        error: "You are a bot!",
        // Useful for debugging, but don't return these to the client in
        // production
        denied: decision.reason.denied,
      });
    } else {
      return res.status(403).json({
        error: "Forbidden",
      });
    }
  }

  // Paid Arcjet accounts include additional verification checks using IP data.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofedBot)) {
    return res.status(403).json({
      error: "You are pretending to be a good bot!",
    });
  }

  res.status(200).json({ name: "Hello world" });
}
