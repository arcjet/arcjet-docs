import {
  launchArcjet,
  detectPromptInjection,
  tokenBucket,
} from "@arcjet/guard";
import {
  guardTool,
  guardHooks,
  strandsAgentContext,
} from "@arcjet/guard/strands-agents/v1";
import { Agent, tool } from "@strands-agents/sdk";
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
  tool({
    name: "lookup_order",
    description: "Look up an order by ID",
    inputSchema: z.object({ orderId: z.string() }),
    callback: ({ orderId }) => ({ orderId, status: "shipped" }),
  }),
  {
    action: "order.looked-up",
    rules: (input: { orderId: string }) => [
      lookupLimit({ key: input.orderId, requested: 5 }),
    ],
  },
);

export async function runAgent(conversationId: string, userText: string) {
  const invocationState = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...strandsAgentContext({ invocationState }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  const agent = new Agent({
    tools: [lookupOrder],
    plugins: [guardHooks(arcjet, { sessionId: conversationId })],
  });

  return agent.invoke(userText, { invocationState });
}
