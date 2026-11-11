import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, policyInput } from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
} from "@arcjet/guard/claude-managed-agents/v0";
import type { AgentCustomToolUseEvent } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();

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
      // Arcjet's server-side detector reads the note for PHI.
      inputs: (input) => ({
        note: policyInput.server.string(String(input.note)),
      }),
      context: claudeManagedAgentsContext({ correlationId: conversationId }),
    },
  );
}
