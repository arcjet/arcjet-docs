import { query, tool } from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import { guardHooks, guardTool } from "@arcjet/guard/claude-agent-sdk/v0";
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
    rules: (input) => [lookupLimit({ key: input.orderId, requested: 5 })],
  },
);

export async function runAgent(sessionId: string, userText: string) {
  for await (const message of query({
    prompt: userText,
    options: {
      sessionId,
      hooks: guardHooks(arcjet, {
        sessionId,
        inbound: {
          action: "message.received",
          rules: ({ prompt }) => [detectPromptInjection()(prompt)],
        },
      }),
    },
  })) {
    void message;
  }
}
