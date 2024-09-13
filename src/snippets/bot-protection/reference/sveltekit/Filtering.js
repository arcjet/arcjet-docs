import { env } from "$env/dynamic/private";
import arcjet, { botCategories, detectBot } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
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

export async function handle({ event, resolve }) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, "You are a bot!");
  }

  return resolve(event);
}
