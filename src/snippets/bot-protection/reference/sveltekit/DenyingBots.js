import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://console.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to deny from
      // https://arcjet.com/bot-list - all other detected bots will be allowed
      deny: [
        "CATEGORY:AI", // denies all detected AI and LLM scrapers
        "CURL", // denies the default user-agent of the `curl` tool
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
