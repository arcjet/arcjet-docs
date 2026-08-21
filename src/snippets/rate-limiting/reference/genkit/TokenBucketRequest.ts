import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/genkit/v1";
import { genkit, z } from "genkit";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const ai = genkit({
  // Configure your model plugin.
});

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

export const lookupOrder = guardTool(
  arcjet,
  ai.defineTool(
    {
      name: "lookup_order",
      description: "Look up an order by ID",
      inputSchema: z.object({ orderId: z.string() }),
    },
    async ({ orderId }) => ({ orderId, status: "shipped" }),
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
