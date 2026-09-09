import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, policyInput } from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
} from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();

async function lookupOrder(input: { [key: string]: unknown }) {
  return { orderId: String(input.orderId), status: "shipped" };
}

export async function runAgent(
  user: { id: string; orderIds: string[] },
  conversationId: string,
  sessionId: string,
  userText: string,
) {
  // Correlation is your own conversation id, never the Anthropic session id.
  const context = claudeManagedAgentsContext({
    correlationId: conversationId,
  });

  const stream = await client.beta.sessions.events.stream(sessionId);

  await client.beta.sessions.events.send(sessionId, {
    events: [
      { type: "user.message", content: [{ type: "text", text: userText }] },
    ],
  });

  for await (const event of stream) {
    // This agent has one tool. Once you add a second, dispatch on
    // `event.name` and return an error for names you do not recognize,
    // so an unexpected name cannot reach a tool that was not meant for it.
    if (event.type === "agent.custom_tool_use") {
      // On deny, guardCustomTool sends the error result itself and
      // lookupOrder never runs.
      const gated = await guardCustomTool(
        arcjet,
        {
          event,
          execute: lookupOrder,
          send: (result) =>
            client.beta.sessions.events.send(sessionId, { events: [result] }),
        },
        {
          // The action selects the policy you published.
          action: "order.looked-up",
          // Actor and the order list come from trusted application state.
          actor: user.id,
          // Map only the values the policy needs.
          inputs: (input) => ({
            order_id: policyInput.server.string(String(input.orderId)),
            owned_orders: policyInput.server.stringList(user.orderIds),
          }),
          context,
        },
      );

      if (gated.allowed) {
        await client.beta.sessions.events.send(sessionId, {
          events: [
            {
              type: "user.custom_tool_result",
              custom_tool_use_id: event.id,
              content: [{ type: "text", text: JSON.stringify(gated.output) }],
            },
          ],
        });
      }
    }
  }
}
