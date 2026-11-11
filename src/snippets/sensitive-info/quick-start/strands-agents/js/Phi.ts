import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/strands-agents/v1";
import { tool } from "@strands-agents/sdk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

// Before the agent runs: reject a note that carries PHI, so the model never
// receives it.
export async function screenNote(userId: string, note: string) {
  const decision = await arcjet.guard({
    label: "note.saved",
    actor: userId,
    inputs: { note: policyInput.server.string(note) },
  });

  if (decision.conclusion === "DENY") {
    // The note carries PHI. Ask the user to remove it.
    throw new Error("Remove health identifiers from the note");
  }

  if (decision.hasFailedOpen()) {
    // Arcjet couldn't complete the check, so the call failed open. Reject the
    // note to fail closed, or log the error and continue to fail open.
    throw new Error("Couldn't check the note for PHI. Try again.");
  }
}

// When the agent calls the tool: stop the tool if its note carries PHI.
// The model has already read this text.
export const saveNote = guardTool(
  arcjet,
  tool({
    name: "save_note",
    description: "Save a free-text note on an order",
    inputSchema: z.object({ orderId: z.string(), note: z.string() }),
    callback: ({ orderId, note }) => ({ orderId, note }),
  }),
  {
    action: "note.saved",
    // Fails closed: if Arcjet can't complete the check, the tool doesn't run.
    // Set "allow" to run the tool anyway.
    onGuardError: "deny",
    // On a denial, tell the model how to recover.
    onDeny: () => ({
      error: "The note contains health identifiers. Remove them and retry.",
    }),
    // Arcjet's server-side detector reads the note for PHI.
    inputs: (input: { note: string }) => ({
      note: policyInput.server.string(input.note),
    }),
  },
);
