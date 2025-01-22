import arcjet, { detectBot } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
  ],
});

function isSpoofed(result) {
  return result.reason.isBot() && result.reason.isSpoofed();
}

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

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
