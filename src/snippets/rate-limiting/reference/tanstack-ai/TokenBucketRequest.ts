import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

const lookupOrderInput = z.object({ orderId: z.string() });

export const middleware = guardMiddleware(arcjet, {
  action: "order.looked-up",
  rules: ({ toolName, input }) => {
    if (toolName !== "lookup_order") {
      return [];
    }
    const { orderId } = lookupOrderInput.parse(input);
    // Deduct 50 tokens from the bucket.
    // The value for `requested` must be a positive integer.
    return [lookupLimit({ key: orderId, requested: 50 })];
  },
});
