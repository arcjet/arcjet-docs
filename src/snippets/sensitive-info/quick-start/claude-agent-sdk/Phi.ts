import { tool } from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/claude-agent-sdk/v0";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export const saveNote = guardTool(
  arcjet,
  tool(
    "save_note",
    "Save a free-text note on an order",
    { orderId: z.string(), note: z.string() },
    async ({ orderId, note }) => ({
      content: [{ type: "text", text: `${orderId}: ${note}` }],
    }),
  ),
  {
    action: "note.saved",
    // Arcjet's server-side detector reads the note for PHI.
    inputs: (input) => ({ note: policyInput.server.string(input.note) }),
  },
);
