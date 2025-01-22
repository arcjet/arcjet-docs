import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
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
    }),
  ],
});

function isSpoofed(result) {
  return result.reason.isBot() && result.reason.isSpoofed();
}

export async function handle({ event, resolve }) {
  const decision = await aj.protect(event);

  // Bots not in the allow list will be blocked
  if (decision.isDenied()) {
    return error(403, "You are a bot!");
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofed)) {
    return error(403, "You are a bot!");
  }

  return resolve(event);
}
