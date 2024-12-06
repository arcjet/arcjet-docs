import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // This allows all sensitive entities other than email addresses and those containing a dash character.
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // allow: ["EMAIL"], Will block all sensitive information types other than email.
      deny: ["EMAIL"], // Will block email addresses
    }),
  ],
});

export async function handle({
  event,
  resolve,
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent) => Response | Promise<Response>;
}): Promise<Response> {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(400, "Bad request - sensitive information detected");
  }

  return resolve(event);
}
