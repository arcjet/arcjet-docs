import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function handle({ event, resolve }) {
  const decision = await aj.protect(event);

  if (decision.reason.isBot()) {
    console.log("detected + allowed bots", decision.reason.allowed);
    console.log("detected + denied bots", decision.reason.denied);

    // Arcjet Pro plan verifies the authenticity of common bots using IP data
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.reason.isSpoofed()) {
      console.log("spoofed bot", decision.reason.spoofed);
    }

    if (decision.reason.isVerified()) {
      console.log("verified bot", decision.reason.verified);
    }
  }

  if (decision.isDenied()) {
    return error(403, "You are a bot!");
  }

  return resolve(event);
}
