import arcjet, { tokenBucket } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
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

export async function loader(args: LoaderFunctionArgs) {
  const userId = "user123"; // Replace with your authenticated user ID
  const decision = await aj.protect(args, { userId, requested: 5 }); // Deduct 5 tokens from the bucket

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      // throw new Response("Service unavailable", { status: 503, statusText: "Service unavailable" });
    }
  }

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}
