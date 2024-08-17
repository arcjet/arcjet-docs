import arcjet, { detectBot } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
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

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
