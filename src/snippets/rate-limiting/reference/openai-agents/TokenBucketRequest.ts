import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/openai-agents/v0";
import { tool } from "@openai/agents";
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
    parameters: z.object({ orderId: z.string() }),
    execute: async ({ orderId }) => ({ orderId, status: "shipped" }),
  }),
  {
    action: "order.looked-up",
    rules: (input: { orderId: string }) => [
      // Deduct 50 tokens from the bucket.
      // The value for `requested` must be a positive integer.
      lookupLimit({ key: input.orderId, requested: 50 }),
    ],
  },
);
