import arcjet, { tokenBucket } from "@arcjet/bun";
import { Hono } from "hono";
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

const app = new Hono();

app.get("/", async (c) => {
  const userId = "user123"; // Replace with your authenticated user ID
  const decision = await aj.protect(c.req.raw, { userId, requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision.conclusion);

  if (decision.isDenied()) {
    return c.json({ error: "Too many requests" }, 429);
  }

  return c.json({ message: "Hello world" });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

export default {
  fetch: aj.handler(app.fetch),
  port,
};
