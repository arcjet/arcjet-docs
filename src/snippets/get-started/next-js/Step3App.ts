import arcjet, {
  type ArcjetRuleResult,
  detectBot,
  shield,
  tokenBucket,
} from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
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

export async function GET(req: Request) {
  const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too Many Requests", reason: decision.reason },
        { status: 429 },
      );
    } else if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "No bots allowed", reason: decision.reason },
        { status: 403 },
      );
    } else {
      return NextResponse.json(
        { error: "Forbidden", reason: decision.reason },
        { status: 403 },
      );
    }
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofed)) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 },
    );
  }

  return NextResponse.json({ message: "Hello world" });
}
