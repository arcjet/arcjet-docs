import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool, guardMiddleware } from "@arcjet/guard/langchain/v1";
import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export function orderTools(user: { id: string; orderIds: string[] }) {
  return guardTool(
    arcjet,
    tool(async ({ orderId }) => ({ orderId, status: "shipped" }), {
      name: "lookup_order",
      description: "Look up an order by ID",
      schema: z.object({ orderId: z.string() }),
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
}

export async function runAgent(
  user: { id: string; orderIds: string[] },
  userText: string,
) {
  const agent = createAgent({
    model: "openai:gpt-4o-mini",
    tools: [orderTools(user)],
    // The middleware gates tools this file did not wrap.
    middleware: [guardMiddleware(arcjet, { sessionId: user.id })],
  });

  return agent.invoke(
    { messages: [{ role: "user", content: userText }] },
    { configurable: { thread_id: user.id } },
  );
}
