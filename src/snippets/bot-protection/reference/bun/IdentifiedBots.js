import arcjet, { detectBot } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const ruleResult of decision.results) {
      if (ruleResult.reason.isBot()) {
        console.log("detected + allowed bots", ruleResult.reason.allowed);
        console.log("detected + denied bots", ruleResult.reason.denied);

        // Arcjet Pro plan verifies the authenticity of common bots using IP data
        // https://docs.arcjet.com/bot-protection/reference#bot-verification
        if (ruleResult.reason.isSpoofed()) {
          console.log("spoofed bot", ruleResult.reason.spoofed);
        }

        if (ruleResult.reason.isVerified()) {
          console.log("verified bot", ruleResult.reason.verified);
        }
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
