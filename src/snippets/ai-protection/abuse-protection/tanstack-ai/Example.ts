import {
  launchArcjet,
  detectPromptInjection,
  tokenBucket,
} from "@arcjet/guard";
import {
  guardMiddleware,
  tanstackAiContext,
} from "@arcjet/guard/tanstack-ai/v0";
import { chat, toolDefinition } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});
const inbound = detectPromptInjection();

const lookupOrderInput = z.object({ orderId: z.string() });

const lookupOrder = toolDefinition({
  name: "lookup_order",
  description: "Look up an order by ID",
  inputSchema: lookupOrderInput,
}).server(({ orderId }) => ({ orderId, status: "shipped" }));

export async function runAgent(conversationId: string, userText: string) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...tanstackAiContext({ context: appContext }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  // There is no `guardTool`. Policy sits on `onBeforeToolCall`, so put
  // Arcjet first in the middleware list.
  return chat({
    adapter: openaiText("gpt-4o-mini"),
    messages: [{ role: "user", content: userText }],
    tools: [lookupOrder],
    context: appContext,
    stream: false,
    middleware: [
      guardMiddleware(arcjet, {
        action: "order.looked-up",
        rules: ({ toolName, input }) => {
          if (toolName !== "lookup_order") {
            return [];
          }
          const { orderId } = lookupOrderInput.parse(input);
          return [lookupLimit({ key: orderId, requested: 5 })];
        },
      }),
    ],
  });
}
