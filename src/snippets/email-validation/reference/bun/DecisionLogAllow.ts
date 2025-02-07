import arcjet, { detectBot, validateEmail } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    validateEmail({
      mode: "LIVE",
      allow: ["DISPOSABLE"],
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
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

    for (const result of decision.results) {
      console.log("Rule Result", result);

      if (result.reason.isEmail()) {
        console.log("Email rule", result);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
