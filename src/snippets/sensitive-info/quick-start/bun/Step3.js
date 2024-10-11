import arcjet, { sensitiveInfo } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    // Configured to return a deny if an email is detected
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      deny: ["EMAIL"],
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Bad request - sensitive information detected", {
        status: 400,
      });
    }

    return new Response("Hello world");
  }),
};
