import arcjet, { detectBot } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Allow other bots, but deny verified Browserbase and Manus sessions
      deny: ["BROWSERBASE", "MANUS_BOT"],
    }),
  ],
});
