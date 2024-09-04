import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
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

export async function handle({ event, resolve }) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, "You are a bot!");
  }

  return resolve(event);
}
