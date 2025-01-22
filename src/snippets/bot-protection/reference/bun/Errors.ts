import arcjet, { ArcjetRuleResult, detectBot } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

function isSpoofed(result: ArcjetRuleResult) {
  return result.reason.isBot() && result.reason.isSpoofed();
}

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isErrored()) {
      if (decision.reason.message.includes("requires user-agent header")) {
        // Requests without User-Agent headers can not be identified as any
        // particular bot and will be marked as an errored decision. Most
        // legitimate clients always send this header, so we recommend blocking
        // requests without it.
        // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
        console.warn("User-Agent header is missing");
        return new Response("Bad request", { status: 400 });
      } else {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", decision.reason.message);
        // You could also fail closed here for very sensitive routes
        //return new Response("Service unavailable", { status: 503 });
      }
    }

    // Bots not in the allow list will be blocked
    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    // Arcjet Pro plan verifies the authenticity of common bots using IP data.
    // Verification isn't always possible, so we recommend checking the decision
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofed)) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
