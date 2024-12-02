import { env } from "$env/dynamic/private";
import arcjet, { shield } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    // DRY_RUN mode logs only. Use "LIVE" to block
    shield({
      mode: "LIVE",
    }),
  ],
});

export async function handle({ event, resolve }) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return resolve(event);
}
