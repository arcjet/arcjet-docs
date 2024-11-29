import { detectBot } from "@arcjet/nest";
// ...
// This is part of the rules constructed using withRule or a guard
// ...
detectBot({
  mode: "LIVE",
  // configured with a list of bots to deny from
  // https://arcjet.com/bot-list - all other detected bots will be allowed
  deny: [
    "CATEGORY:AI", // denies all detected AI and LLM scrapers
    "CURL", // denies the default user-agent of the `curl` tool
  ],
});
