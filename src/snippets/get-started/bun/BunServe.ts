/// <reference types="bun-types/bun.d.ts" />
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";
import { isSpoofedBot } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

Bun.serve({
  async fetch(req: Request) {
    const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision.conclusion);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return new Response("Too many requests", { status: 429 });
      } else if (decision.reason.isBot()) {
        return new Response("No bots allowed", { status: 403 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }

    // Paid Arcjet accounts include additional verification checks using IP data.
    // Verification isn't always possible, so we recommend checking the decision
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofedBot)) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  },
});
