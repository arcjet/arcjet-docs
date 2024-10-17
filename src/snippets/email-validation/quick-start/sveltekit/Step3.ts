import { env } from "$env/dynamic/private";
import arcjet, { validateEmail } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    validateEmail({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // block disposable, invalid, and email addresses with no MX records
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});

export async function POST(event: RequestEvent) {
  const decision = await aj.protect(event, {
    // The email prop is required when a validateEmail rule is configured.
    // TypeScript will guide you based on the configured rules
    email: "test@0zc7eznv3rsiswlohu.tk",
  });

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return json({ message: "Hello world" });
}
