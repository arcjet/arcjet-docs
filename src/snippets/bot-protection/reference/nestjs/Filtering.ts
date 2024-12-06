import { botCategories, detectBot } from "@arcjet/nest";
// ...
// This is part of the rules constructed using withRule or a guard
// ...
detectBot({
  mode: "LIVE",
  // configured with a list of bots to allow from
  // https://arcjet.com/bot-list - all other detected bots will be blocked
  allow: [
    // filter a category to remove individual bots from our provided lists
    ...botCategories["CATEGORY:GOOGLE"].filter(
      (bot) => bot !== "GOOGLE_ADSBOT" && bot !== "GOOGLE_ADSBOT_MOBILE",
    ),
  ],
});
