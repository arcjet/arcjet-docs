import "jsr:@std/dotenv/load";

import arcjet, { shield, tokenBucket } from "npm:@arcjet/deno";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!, // Get your site key from https://app.arcjet.com
  characteristics: ["userId"], // track requests by a custom user ID
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
    // Protect against common attacks.
    shield({ mode: "LIVE" }),
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
    const userId = "user123"; // Replace with your authenticated user ID
    const decision = await aj.protect(req, { userId, requested: 5 }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Too many requests", { status: 429 });
    }

    return new Response("Hello world");
  }),
);
