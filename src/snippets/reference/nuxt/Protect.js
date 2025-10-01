import arcjet, { tokenBucket } from "#arcjet";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
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

// The loader function is called for every request to the app, but you could
// also protect an action
export async function loader(args) {
  const userId = "user123"; // Replace with your authenticated user ID
  // The userId prop is required because it is defined in the characteristics
  // prop of the tokenBucket rule.
  const decision = await aj.protect(args, { userId, requested: 5 }); // Deduct 5 tokens from the bucket

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}
