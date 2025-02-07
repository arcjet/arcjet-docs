import arcjet, {
  type ArcjetRuleResult,
  detectBot,
  shield,
  tokenBucket,
} from "@arcjet/bun";
import { Hono } from "hono";
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

function isSpoofed(result: ArcjetRuleResult) {
  return (
    // You probably don't want DRY_RUN rules resulting in a denial
    // since they are generally used for evaluation purposes but you
    // could log here.
    result.state !== "DRY_RUN" &&
    result.reason.isBot() &&
    result.reason.isSpoofed()
  );
}

const app = new Hono();

app.get("/", async (c) => {
  const decision = await aj.protect(c.req.raw, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision.conclusion);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return c.json({ error: "Too many requests" }, 429);
    } else if (decision.reason.isBot()) {
      return c.json({ error: "No bots allowed" }, 403);
    } else {
      return c.json({ error: "Forbidden" }, 403);
    }
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofed)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json({ message: "Hello world" });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

export default {
  fetch: aj.handler(app.fetch),
  port,
};
