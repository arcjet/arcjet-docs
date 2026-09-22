import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupOrderInput = z.object({ orderId: z.string() });

const lookupOrder = new FunctionTool({
  name: "lookup_order",
  description: "Look up an order by ID",
  parameters: lookupOrderInput,
  execute: ({ orderId }) => ({ orderId, status: "shipped" }),
});

const agent = new LlmAgent({
  name: "order_agent",
  model: "gemini-flash-latest",
  instruction: "Look up orders with lookup_order.",
  tools: [lookupOrder],
});

export async function runAgent(
  user: { id: string; orderIds: string[] },
  userText: string,
) {
  // guardPlugin gates every tool call. There is no guardTool for ADK.
  const runner = new InMemoryRunner({
    agent,
    appName: "orders",
    plugins: [
      guardPlugin(arcjet, {
        sessionId: user.id,
        // The action selects the policy you published.
        action: ({ toolName }) =>
          toolName === "lookup_order" ? "order.looked-up" : "tool.invoked",
        // Actor and the order list come from trusted application state.
        actor: user.id,
        // The plugin gates every tool, so map inputs only for the one the
        // policy covers.
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

  return runner.runAsync({
    userId: user.id,
    sessionId: user.id,
    newMessage: { parts: [{ text: userText }] },
  });
}
