import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/mastra/v1";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export function createOrderAgent(user: { id: string; orderIds: string[] }) {
  const lookupOrder = guardTool(
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

  return new Agent({
    id: "support-agent",
    name: "support-agent",
    instructions: "Help the user look up orders.",
    model: "openai/gpt-4o-mini",
    tools: { lookupOrder },
  });
}
