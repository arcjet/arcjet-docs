import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo } from "@arcjet/sveltekit";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // Detect names and email addresses. See the reference for the full list.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME"],
      // Use the on-device Rampart NER model instead of the built-in engine.
      backend: rampart(),
    }),
  ],
});

export async function handle({ event, resolve }) {
  const decision = await aj.protect(event);
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    return error(400, "Bad request - sensitive information detected");
  }

  return resolve(event);
}
