import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import {
  guardTool,
  guardMiddleware,
  langchainContext,
} from "@arcjet/guard/langchain/v1";
import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});
const inbound = detectPromptInjection();

export const lookupOrder = guardTool(
  arcjet,
  tool(
    async ({ orderId }) => ({ orderId, status: "shipped" }),
    {
      name: "lookup_order",
      description: "Look up an order by ID",
      schema: z.object({ orderId: z.string() }),
    },
  ),
  {
    action: "order.looked-up",
    rules: (input) => [lookupLimit({ key: input.orderId, requested: 5 })],
  },
);

export async function runAgent(conversationId: string, userText: string) {
  const config = { configurable: { thread_id: conversationId } };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...langchainContext(config),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  const agent = createAgent({
    model: "openai:gpt-4o-mini",
    tools: [lookupOrder],
    middleware: [guardMiddleware(arcjet, { sessionId: conversationId })],
  });

  return agent.invoke(
    { messages: [{ role: "user", content: userText }] },
    config,
  );
}
