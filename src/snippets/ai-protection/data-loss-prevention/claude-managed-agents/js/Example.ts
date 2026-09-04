import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
} from "@arcjet/guard/claude-managed-agents/v0";
import type { AgentCustomToolUseEvent } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();
const detectPii = localDetectSensitiveInfo({
  deny: ["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
});

// Anthropic runs built-in tools in its own environment, so a custom tool
// your app executes is the boundary you still hold.
export function saveNote(
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
        note: String(input.note),
      }),
      send: (result) =>
        client.beta.sessions.events.send(sessionId, { events: [result] }),
    },
    {
      action: "note.saved",
      rules: (input) => [detectPii(String(input.note))],
      // Correlation is your own conversation id, never the Anthropic
      // session id.
      context: claudeManagedAgentsContext({ correlationId: conversationId }),
    },
  );
}
