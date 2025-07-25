import Fastify from "fastify";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/fastify";

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

const fastify = Fastify({ logger: true });

fastify.get("/", async (request, reply) => {
  const decision = await aj.protect(request, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return reply
        .status(429)
        .header("Content-Type", "application/json")
        .send({ message: "Too many requests" });
    }

    if (decision.reason.isBot()) {
      return reply
        .status(403)
        .header("Content-Type", "application/json")
        .send({ message: "No bots allowed" });
    }

    return reply
      .status(403)
      .header("Content-Type", "application/json")
      .send({ message: "Forbidden" });
  }

  return reply
    .status(200)
    .header("Content-Type", "application/json")
    .send({ message: "Hello world" });
});

await fastify.listen({ port: 3000 });
