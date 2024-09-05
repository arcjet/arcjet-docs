import arcjet, { detectBot } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list - all other detected bots will be blocked
      allow: [
        // Google has multiple crawlers, each with a different user-agent. Check
        // the full list for more options
        "GOOGLE_CRAWLER", // allows Google's main crawler
        "GOOGLE_ADSBOT", // allows Google Adsbot
        "GOOGLE_CRAWLER_NEWS", // allows Google News crawler
        "CURL", // allows the default user-agent of the `curl` tool
        "DISCORD_CRAWLER", // allows Discordbot
      ],
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);
  console.log("Decision", decision);

  if (decision.isDenied() && decision.reason.isBot()) {
    return res.status(403).json({
      error: "Forbidden",
      // Useful for debugging, but don't return these to the client in
      // production
      denied: decision.reason.denied,
    });
  }

  res.status(200).json({ name: "Hello world" });
}
