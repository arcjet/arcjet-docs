import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { chat, toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupOrderInput = z.object({ orderId: z.string() });

export const lookupOrder = toolDefinition({
  name: "lookup_order",
  description: "Look up an order by ID",
  inputSchema: lookupOrderInput,
}).server(({ orderId }) => ({ orderId, status: "shipped" }));

export async function runAgent(
  user: { id: string; orderIds: string[] },
  userText: string,
  adapter: object,
) {
  return chat({
    adapter,
    messages: [{ role: "user", content: userText }],
    tools: [lookupOrder],
    context: { sessionId: user.id },
    middleware: [
      guardMiddleware(arcjet, {
        sessionId: user.id,
        // The action selects the policy you published.
        action: ({ toolName }) =>
          toolName === "lookup_order" ? "order.looked-up" : "tool.invoked",
        // Actor and the order list come from trusted application state.
        actor: user.id,
        // The middleware gates every tool, so map inputs only for the one
        // the policy covers.
        inputs: ({ toolName, input }) => {
          if (toolName !== "lookup_order") {
            return {};
          }
          const { orderId } = lookupOrderInput.parse(input);
          return {
            order_id: policyInput.server.string(orderId),
            owned_orders: policyInput.server.stringList(user.orderIds),
          };
        },
      }),
    ],
  });
}
