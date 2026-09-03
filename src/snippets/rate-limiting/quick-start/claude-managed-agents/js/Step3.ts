import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardCustomTool } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

export const lookupOrder = guardCustomTool(
  arcjet,
  async ({ orderId }: { orderId: string }) => ({
    orderId,
    status: "shipped",
  }),
  {
    action: "order.looked-up",
    rules: ({ orderId }) => [lookupLimit({ key: orderId, requested: 5 })],
  },
);
