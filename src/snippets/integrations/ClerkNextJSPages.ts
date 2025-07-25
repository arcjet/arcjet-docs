import arcjet, { tokenBucket } from "@arcjet/next";
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

// The arcjet instance is created outside of the handler
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      characteristics: ["userId"], // Track based on the Clerk userId
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Get the current user from Clerk
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Deduct 5 tokens from the user's bucket
  const decision = await aj.protect(req, { userId, requested: 5 });

  if (decision.isDenied()) {
    return res
      .status(429)
      .json({ error: "Too Many Requests", reason: decision.reason });
  }

  return res.status(200).json({ message: "Hello World" });
}
