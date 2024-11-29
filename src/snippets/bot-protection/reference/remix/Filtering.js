import arcjet, { botCategories, detectBot } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
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
    }),
  ],
});

export async function loader(args) {
  const decision = await aj.protect(args);

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  if (decision.reason.isBot() && decision.reason.isSpoofed()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}
