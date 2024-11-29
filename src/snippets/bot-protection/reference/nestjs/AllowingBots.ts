import { detectBot } from "@arcjet/nest";
// ...
// This is part of the rules constructed using withRule or a guard
// ...
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
});
