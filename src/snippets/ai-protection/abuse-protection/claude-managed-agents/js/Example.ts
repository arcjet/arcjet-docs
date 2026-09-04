import Anthropic from "@anthropic-ai/sdk";
import {
  launchArcjet,
  detectPromptInjection,
  tokenBucket,
} from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
  guardEvents,
} from "@arcjet/guard/claude-managed-agents/v0";
import type { AgentCustomToolUseEvent } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

// Anthropic has already chosen the tool by the time this event arrives, so
// the gate goes around the body your app executes. On deny, guardCustomTool
// sends the error result itself and the body never runs.
export function lookupOrder(
  event: AgentCustomToolUseEvent,
  sessionId: string,
  conversationId: string,
) {
  return guardCustomTool(
    arcjet,
    {
      event,
      execute: async (input) => ({
        orderId: String(input.orderId),
        status: "shipped",
      }),
      send: (result) =>
        client.beta.sessions.events.send(sessionId, { events: [result] }),
    },
    {
      action: "order.looked-up",
      rules: (input) => [
        lookupLimit({ key: String(input.orderId), requested: 5 }),
      ],
      // Correlation is your own conversation id, never the Anthropic
      // session id.
      context: claudeManagedAgentsContext({ correlationId: conversationId }),
    },
  );
}

export async function sendTurn(
  sessionId: string,
  conversationId: string,
  userText: string,
) {
  // guardEvents screens the prompt and only then sends `user.message`, so on
  // deny the model never sees it.
  const inbound = await guardEvents(
    arcjet,
    {
      events: [
        { type: "user.message", content: [{ type: "text", text: userText }] },
      ],
      inbound: {
        action: "message.received",
        rules: ({ text }) => [detectPromptInjection()(text)],
      },
      context: claudeManagedAgentsContext({ correlationId: conversationId }),
    },
    (body) => client.beta.sessions.events.send(sessionId, body),
  );

  if (!inbound.allowed) {
    throw new Error(inbound.message);
  }
}
