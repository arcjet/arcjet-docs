import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error, json } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function GET(event) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, { message: "Forbidden" });
  }

  return json({ message: "Hello world" });
}
