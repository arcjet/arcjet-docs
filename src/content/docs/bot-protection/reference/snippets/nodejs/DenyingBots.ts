import arcjet, { detectBot } from "@arcjet/node";
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to deny from
      // https://arcjet.com/bot-list - all other detected bots will be allowed
      deny: [
        "PERPLEXITY_CRAWLER", // denies PerplexityBot
        "CURL", // denies the default user-agent of the `curl` tool
        "ANTHROPIC_CRAWLER", // denies Claudebot
      ],
    }),
  ],
});
