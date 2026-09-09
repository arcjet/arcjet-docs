import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/openai-agents/v0";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export function orderTools(user: { id: string; orderIds: string[] }) {
  return guardTool(
    arcjet,
    tool({
      name: "lookup_order",
      description: "Look up an order by ID",
      parameters: z.object({ orderId: z.string() }),
      execute: async ({ orderId }) => ({ orderId, status: "shipped" }),
    }),
    {
      // The action selects the policy you published.
      action: "order.looked-up",
      // Actor and the order list come from trusted application state.
      actor: user.id,
      // Map only the values the policy needs.
      inputs: (input: { orderId: string }) => ({
        order_id: policyInput.server.string(input.orderId),
        owned_orders: policyInput.server.stringList(user.orderIds),
      }),
    },
  );
}

export async function runAgent(
  user: { id: string; orderIds: string[] },
  userText: string,
) {
  const agent = new Agent({
    name: "support-agent",
    instructions: "Help the user look up orders.",
    tools: [orderTools(user)],
  });

  return run(agent, userText, { context: { sessionId: user.id } });
}
