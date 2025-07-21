import { env } from "$env/dynamic/private";
import arcjet, { tokenBucket } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com
  // and set it as an environment variable rather than hard coding.
  // See: https://kit.svelte.dev/docs/modules#$env-dynamic-private
  key: env.ARCJET_KEY!,
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      characteristics: ["userId"], // track requests by a custom user ID
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
  ],
});

export async function GET(event: RequestEvent) {
  const userId = "user123"; // Replace with your authenticated user ID
  const decision = await aj.protect(event, { userId, requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    return error(429, { message: "Too many requests" });
  }

  return json({ message: "Hello world" });
}
