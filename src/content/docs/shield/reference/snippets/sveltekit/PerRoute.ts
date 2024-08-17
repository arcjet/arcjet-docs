import { env } from "$env/dynamic/private";
import arcjet, { shield } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

export async function load(event: RequestEvent) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, "You are suspicious!");
  }

  return {};
}
