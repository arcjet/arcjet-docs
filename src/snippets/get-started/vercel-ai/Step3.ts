import { launchArcjet, policyInput } from "@arcjet/guard";
import {
  aiToolsContext,
  createAgentContext,
  guardTool,
} from "@arcjet/guard/vercel-ai/v7";
import { generateText, tool } from "ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export async function runAgent(
  user: { id: string; orderIds: string[] },
  prompt: string,
) {
  const lookupOrder = guardTool(
    arcjet,
    tool({
      description: "Look up an order by ID",
      inputSchema: z.object({ orderId: z.string() }),
      execute: async ({ orderId }) => ({ orderId, status: "shipped" }),
    }),
    {
      // The action selects the policy you published.
      action: "order.looked-up",
      // Actor and the order list come from trusted application state.
      actor: user.id,
      // Map only the values the policy needs.
      inputs: ({ orderId }) => ({
        order_id: policyInput.server.string(orderId),
        owned_orders: policyInput.server.stringList(user.orderIds),
      }),
    },
  );

  const tools = { lookupOrder };
  const context = createAgentContext({ correlationId: user.id });

  return generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    tools,
    toolsContext: aiToolsContext(context, tools),
  });
}
