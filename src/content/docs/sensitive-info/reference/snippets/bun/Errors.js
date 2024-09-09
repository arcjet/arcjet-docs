import arcjet, { sensitiveInfo } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isErrored()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", decision.reason.message);
      // You could also fail closed here for very sensitive routes
      //return new Response("Service unavailable", { status: 503 });
    }

    if (decision.isDenied()) {
      return new Response(
        "Your request contained unexpected sensitive information!",
        { status: 400 },
      );
    }

    return new Response("Hello world");
  }),
};
