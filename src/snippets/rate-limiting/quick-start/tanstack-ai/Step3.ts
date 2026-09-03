import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

const lookupOrderInput = z.object({ orderId: z.string() });

export const lookupOrder = toolDefinition({
  name: "lookup_order",
  description: "Look up an order by ID",
  inputSchema: lookupOrderInput,
}).server(({ orderId }) => ({ orderId, status: "shipped" }));

// There is no `guardTool`. Policy sits on `onBeforeToolCall`, so put Arcjet
// first in the middleware list.
export const middleware = guardMiddleware(arcjet, {
  action: "order.looked-up",
  rules: ({ toolName, input }) => {
    if (toolName !== "lookup_order") {
      return [];
    }
    const { orderId } = lookupOrderInput.parse(input);
    return [lookupLimit({ key: orderId, requested: 5 })];
  },
});
