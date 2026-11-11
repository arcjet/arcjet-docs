import { launchArcjet, policyInput } from "@arcjet/guard";
import type { PolicyInputMap } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { toolDefinition } from "@tanstack/ai";
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

const saveNoteInput = z.object({
  orderId: z.string(),
  note: z.string(),
});

export const saveNote = toolDefinition({
  name: "save_note",
  description: "Save a free-text note on an order",
  inputSchema: saveNoteInput,
}).server(({ orderId, note }) => ({ orderId, note }));

// When the agent calls `save_note`: stop the tool if its note carries PHI.
// The model has already read this text. The middleware gates every tool, so
// select the PHI policy only for `save_note`.
export const middleware = guardMiddleware(arcjet, {
  action: ({ toolName }) =>
    toolName === "save_note" ? "note.saved" : "tool.invoked",
  // Fails closed: if Arcjet can't complete the check, the tool doesn't run.
  // Set "allow" to run the tool anyway.
  onGuardError: "deny",
  // On a denial, stop the chat run instead of returning the denial to the
  // model.
  onDeny: "abort",
  inputs: ({ toolName, input }): PolicyInputMap => {
    if (toolName !== "save_note") {
      return {};
    }
    const { note } = saveNoteInput.parse(input);
    // Arcjet's server-side detector reads the note for PHI.
    return { note: policyInput.server.string(note) };
  },
});
