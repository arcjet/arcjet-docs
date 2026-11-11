import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, policyInput } from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
} from "@arcjet/guard/claude-managed-agents/v0";
import type { AgentCustomToolUseEvent } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

// Before the agent runs: reject a note that carries PHI, so the model never
// receives it.
export async function screenNote(userId: string, note: string) {
  const decision = await arcjet.guard({
    label: "note.saved",
    actor: userId,
    inputs: { note: policyInput.server.string(note) },
  });

  // A direct call fails open, so reject failed-open decisions as well.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Remove health identifiers from the note");
  }
}
const client = new Anthropic();

// When the agent calls the tool: stop the tool if its note carries PHI.
// The model has already read this text.
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
