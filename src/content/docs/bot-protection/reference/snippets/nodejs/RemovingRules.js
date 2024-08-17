import arcjet, { detectBot } from "@arcjet/node";
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      block: [
        // Only block clients we're sure are automated bots
        "AUTOMATED",
      ],
      patterns: {
        remove: [
          // Removes the datadog agent from the list of bots so it will be
          // considered as ArcjetBotType.LIKELY_NOT_A_BOT
          "datadog agent",
          // Allow curl clients to pass through. Matches a user agent
          // string with the word "curl" in it
          "^curl",
          // Allow generally friendly bots like GoogleBot and DiscordBot. These
          // have a more complex user agent like "AdsBot-Google
          // (+https://www.google.com/adsbot.html)" or "Mozilla/5.0 (compatible;
          // Discordbot/2.0; +https://discordapp.com)" so need multiple patterns
          "^[a-z.0-9/ \\-_]*bot",
          "bot($|[/\\);-]+)",
          "http[s]?://",
        ],
      },
    }),
  ],
});
