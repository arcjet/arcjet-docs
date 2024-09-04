import arcjet, { detectBot } from "@arcjet/node";
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      // selectively allow known bots from our list of almost 600 bots while
      // blocking all other detected bots
      allow: [
        "GOOGLE_CRAWLER", // allows Googlebot
        "CURL", // allows the default user-agent of the `curl` tool
        "DISCORD_CRAWLER", // allows Discordbot
      ],
    }),
  ],
});
