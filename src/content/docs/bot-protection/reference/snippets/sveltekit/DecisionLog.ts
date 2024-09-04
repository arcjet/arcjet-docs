import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function POST(event: RequestEvent) {
  const decision = await aj.protect(event);
  console.log("Arcjet decision", decision);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isRateLimit()) {
      console.log("Rate limit rule", result);
    }

    if (result.reason.isBot()) {
      console.log("Bot protection rule", result);
    }
  }

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return json({ message: "Hello world" });
}
