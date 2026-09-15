import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/vercel-eve/v0";
import { defineTool } from "eve/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export function orderTools(user: { id: string; orderIds: string[] }) {
  return guardTool(
    arcjet,
    defineTool({
      description: "Look up an order by ID",
      inputSchema: z.object({ orderId: z.string() }),
      async execute(input) {
        return { orderId: input.orderId, status: "shipped" };
      },
    }),
    {
      // The action selects the policy you published.
      action: "order.looked-up",
      // On DENY, Eve projects a throw as a failed action.result. Pass
      // onDeny: "result" so the model can read the denial payload.
      onDeny: "result",
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
