import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import {
  guardMiddleware,
  tanstackAiContext,
} from "@arcjet/guard/tanstack-ai/v0";
import { chat, toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});
const inbound = detectPromptInjection();

export const lookupOrder = toolDefinition({
  name: "lookup_order",
  description: "Look up an order by ID",
  inputSchema: z.object({ orderId: z.string() }),
}).server(({ orderId }) => ({ orderId, status: "shipped" }));

export async function runAgent(
  conversationId: string,
  userText: string,
  adapter: object,
) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...tanstackAiContext({ context: appContext }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  return chat({
    adapter,
    messages: [{ role: "user", content: userText }],
    tools: [lookupOrder],
    context: appContext,
    middleware: [
      guardMiddleware(arcjet, {
        sessionId: conversationId,
        rules: ({ toolName, input }) => {
          if (toolName !== "lookup_order") {
            return [];
          }
          const args = input as { orderId: string };
          return [lookupLimit({ key: args.orderId, requested: 5 })];
        },
      }),
    ],
  });
}
