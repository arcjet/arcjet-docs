import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
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
// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj);
