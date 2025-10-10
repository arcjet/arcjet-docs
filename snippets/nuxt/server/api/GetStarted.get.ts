// @ts-expect-error
// The `#arcjet` virtual module is created created when using @arcjet/nuxt
import arcjetNuxt, { detectBot, shield, tokenBucket } from "#arcjet";

const arcjet = arcjetNuxt({
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
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests",
      });
    }

    if (decision.reason.isBot()) {
      throw createError({
        statusCode: 403,
        statusMessage: "No bots allowed",
      });
    }
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return { message: "Hello world" };
});
