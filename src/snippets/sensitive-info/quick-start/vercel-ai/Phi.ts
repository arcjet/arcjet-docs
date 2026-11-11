import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/vercel-ai/v7";
import { tool } from "ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export const saveNote = guardTool(
  arcjet,
  tool({
    description: "Save a free-text note on an order",
    inputSchema: z.object({ orderId: z.string(), note: z.string() }),
    execute: async ({ orderId, note }) => ({ orderId, note }),
  }),
  {
    action: "note.saved",
    // Arcjet's server-side detector reads the note for PHI.
    inputs: (input) => ({ note: policyInput.server.string(input.note) }),
  },
);
