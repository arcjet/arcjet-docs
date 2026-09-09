import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool, guardMiddleware } from "@arcjet/guard/genkit/v1";
import { genkit, z } from "genkit";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const ai = genkit({
  // Configure your model plugin.
});

export function orderTools(user: { id: string; orderIds: string[] }) {
  return guardTool(
    arcjet,
    ai.defineTool(
      {
        name: "lookup_order",
        description: "Look up an order by ID",
        inputSchema: z.object({ orderId: z.string() }),
      },
      async ({ orderId }) => ({ orderId, status: "shipped" }),
    ),
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
  return ai.generate({
    prompt: userText,
    tools: [orderTools(user)],
    // The middleware gates tools this file did not wrap.
    use: [guardMiddleware(arcjet, { sessionId: user.id })],
    context: { sessionId: user.id },
  });
}
