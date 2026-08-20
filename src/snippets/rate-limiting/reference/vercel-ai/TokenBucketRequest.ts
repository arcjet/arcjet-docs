import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/vercel-ai/v7";
import { tool } from "ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

export const lookupOrder = guardTool(
  arcjet,
  tool({
    description: "Look up an order by ID",
    inputSchema: z.object({ orderId: z.string() }),
    execute: async ({ orderId }) => ({ orderId, status: "shipped" }),
  }),
  {
    action: "order.looked-up",
    actor: "user123", // Replace with your authenticated user ID
    rules: () => [
      // Deduct 50 tokens from the bucket.
      // The value for `requested` must be a positive integer.
      lookupLimit({ key: "user123", requested: 50 }),
    ],
  },
);
