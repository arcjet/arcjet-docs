import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/strands-agents/v1";
import { tool } from "@strands-agents/sdk";
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
    name: "lookup_order",
    description: "Look up an order by ID",
    inputSchema: z.object({ orderId: z.string() }),
    callback: ({ orderId }) => ({ orderId, status: "shipped" }),
  }),
  {
    action: "order.looked-up",
    rules: (input) => [
      // Deduct 50 tokens from the bucket.
      // The value for `requested` must be a positive integer.
      lookupLimit({ key: input.orderId, requested: 50 }),
    ],
  },
);
