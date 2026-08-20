import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import {
  aiToolsContext,
  createAgentContext,
  guardTool,
} from "@arcjet/guard/vercel-ai/v7";
import { generateText, tool } from "ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});
const inbound = detectPromptInjection();

export async function runAgent(userId: string, prompt: string) {
  const decision = await arcjet.guard({
    label: "message.received",
    actor: userId,
    rules: [inbound(prompt)],
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  const lookupOrder = guardTool(
    arcjet,
    tool({
      description: "Look up an order by ID",
      inputSchema: z.object({ orderId: z.string() }),
      execute: async ({ orderId }) => ({ orderId, status: "shipped" }),
    }),
    {
      action: "order.looked-up",
      actor: userId,
      rules: () => [lookupLimit({ key: userId, requested: 5 })],
    },
  );

  const tools = { lookupOrder };
  const context = createAgentContext({ correlationId: userId });

  return generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    tools,
    toolsContext: aiToolsContext(context, tools),
  });
}
