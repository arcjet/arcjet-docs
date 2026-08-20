import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/vercel-eve/v0";
import { defineTool } from "eve/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

export default guardTool(
  arcjet,
  defineTool({
    description: "Look up an order by ID",
    inputSchema: z.object({ orderId: z.string() }),
    async execute(input) {
      return { orderId: input.orderId, status: "shipped" };
    },
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
