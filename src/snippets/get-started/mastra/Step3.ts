import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import { guardProcessor, guardTool } from "@arcjet/guard/mastra/v1";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
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
  createTool({
    id: "lookup-order",
    description: "Look up an order by ID",
    inputSchema: z.object({ orderId: z.string() }),
    async execute({ orderId }) {
      return { orderId, status: "shipped" };
    },
  }),
  {
    action: "order.looked-up",
    rules: (input) => [lookupLimit({ key: input.orderId, requested: 5 })],
  },
);

const inbound = guardProcessor(arcjet, {
  action: "message.received",
  rules: ({ text }) => [detectPromptInjection()(text)],
});

export const agent = new Agent({
  id: "support-agent",
  name: "support-agent",
  instructions: "Help the user look up orders.",
  model: "openai/gpt-4o-mini",
  tools: { lookupOrder },
  inputProcessors: [inbound],
});
