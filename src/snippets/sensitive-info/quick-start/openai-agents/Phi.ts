import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/openai-agents/v0";
import { tool } from "@openai/agents";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export const saveNote = guardTool(
  arcjet,
  tool({
    name: "save_note",
    description: "Save a free-text note on an order",
    parameters: z.object({ orderId: z.string(), note: z.string() }),
    execute: async ({ orderId, note }) => ({ orderId, note }),
  }),
  {
    action: "note.saved",
    // Arcjet's server-side detector reads the note for PHI.
    inputs: (input: { note: string }) => ({
      note: policyInput.server.string(input.note),
    }),
  },
);
