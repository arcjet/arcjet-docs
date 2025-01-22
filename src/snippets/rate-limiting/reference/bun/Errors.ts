import arcjet, { tokenBucket } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["userId"], // track requests by a custom user ID
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const userId = "user123"; // Replace with your authenticated user ID
    const decision = await aj.protect(req, { userId, requested: 5 }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision);

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //return new Response("Service unavailable", { status: 503 });
      }
    }

    if (decision.isDenied()) {
      return new Response("Too many requests", { status: 429 });
    }

    return new Response("Hello world");
  }),
};
