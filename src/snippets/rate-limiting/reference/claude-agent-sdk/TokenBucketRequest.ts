import { tool } from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/claude-agent-sdk/v0";
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
  tool(
    "lookup_order",
    "Look up an order by ID",
    { orderId: z.string() },
    async ({ orderId }) => ({
      content: [{ type: "text", text: `${orderId}: shipped` }],
    }),
  ),
  {
    action: "order.looked-up",
    rules: (input) => [
      // Deduct 50 tokens from the bucket.
      // The value for `requested` must be a positive integer.
      lookupLimit({ key: input.orderId, requested: 50 }),
    ],
  },
);
