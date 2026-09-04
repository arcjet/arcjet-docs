import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, tokenBucket } from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
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
// the gate goes around the body your app executes.
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
