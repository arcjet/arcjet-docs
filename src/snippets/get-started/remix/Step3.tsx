import arcjet, {
  type ArcjetRuleResult,
  detectBot,
  shield,
  tokenBucket,
} from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
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

// The loader function is called for every request to the app, but you could
// also protect an action
export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw new Response("Too many requests", {
        status: 429,
        statusText: "Too many requests",
      });
    } else if (decision.reason.isBot()) {
      throw new Response("Bots forbidden", {
        status: 403,
        statusText: "Bots forbidden",
      });
    } else {
      throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
    }
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofed)) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}

export default function Index() {
  return (
    <>
      <h1>Hello world</h1>
    </>
  );
}
