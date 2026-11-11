import { launchArcjet, policyInput } from "@arcjet/guard";
import type { PolicyInputMap } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const saveNoteInput = z.object({
  orderId: z.string(),
  note: z.string(),
});

export const saveNote = toolDefinition({
  name: "save_note",
  description: "Save a free-text note on an order",
  inputSchema: saveNoteInput,
}).server(({ orderId, note }) => ({ orderId, note }));

// The middleware gates every tool, so select the PHI policy and map the note
// only for `save_note`.
export const middleware = guardMiddleware(arcjet, {
  action: ({ toolName }) =>
    toolName === "save_note" ? "note.saved" : "tool.invoked",
  inputs: ({ toolName, input }): PolicyInputMap => {
    if (toolName !== "save_note") {
      return {};
    }
    const { note } = saveNoteInput.parse(input);
    // Arcjet's server-side detector reads the note for PHI.
    return { note: policyInput.server.string(note) };
  },
});
