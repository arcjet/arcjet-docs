import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import { guardInbound, guardTool } from "@arcjet/guard/vercel-eve/v0";
import { defineTool } from "eve/tools";
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
  defineTool({
    description: "Look up an order by ID",
    inputSchema: z.object({ orderId: z.string() }),
    async execute(input) {
      return { orderId: input.orderId, status: "shipped" };
    },
  }),
  {
    action: "order.looked-up",
    rules: (input) => [lookupLimit({ key: input.orderId, requested: 5 })],
  },
);

export async function screenInbound(
  message: string,
  conversationId: string,
) {
  const verdict = await guardInbound(arcjet, message, {
    action: "message.received",
    correlationId: conversationId,
    rules: [detectPromptInjection()(message)],
  });

  if (!verdict.allowed) {
    throw new Error(verdict.message);
  }
}
