import { env } from "$env/dynamic/private";
import arcjet, { validateEmail } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    validateEmail({
      mode: "LIVE",
      deny: ["DISPOSABLE"],
    }),
  ],
});

export async function POST(event: RequestEvent) {
  const decision = await aj.protect(event, {
    // The email prop is required when a validateEmail rule is configured.
    // TypeScript will guide you based on the configured rules
    email: "test@0zc7eznv3rsiswlohu.tk",
  });

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    //return error(503, { message: "Service unavailable" });
  }

  if (decision.isDenied()) {
    return error(403, { message: "Forbidden" });
  }

  return json({ message: "Hello world" });
}
