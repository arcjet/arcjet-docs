import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool, guardHooks } from "@arcjet/guard/strands-agents/v1";
import { Agent, tool } from "@strands-agents/sdk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export function orderTools(user: { id: string; orderIds: string[] }) {
  return guardTool(
    arcjet,
    tool({
      name: "lookup_order",
      description: "Look up an order by ID",
      inputSchema: z.object({ orderId: z.string() }),
      callback: ({ orderId }) => ({ orderId, status: "shipped" }),
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
    tools: [orderTools(user)],
    // The hooks gate tools this file did not wrap.
    plugins: [guardHooks(arcjet, { sessionId: user.id })],
  });

  return agent.invoke(userText, { invocationState: { sessionId: user.id } });
}
