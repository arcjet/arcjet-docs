import arcjet, { validateEmail } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE"],
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req, {
      // The email prop is required when a validateEmail rule is configured.
      // TypeScript will guide you based on the configured rules
      email: "test@0zc7eznv3rsiswlohu.tk",
    });

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        // return new Response("Service unavailable", { status: 503 });
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
