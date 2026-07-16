import arcjet, { sensitiveInfo } from "@arcjet/bun";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { env } from "bun";

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

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const data = await req.text();

    const decision = await aj.protect(req, {
      sensitiveInfoValue: data,
    });

    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Bad request - sensitive information detected", {
        status: 400,
      });
    }

    return new Response("Hello world");
  }),
};
