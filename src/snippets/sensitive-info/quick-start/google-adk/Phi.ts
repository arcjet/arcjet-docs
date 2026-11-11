import { launchArcjet, policyInput } from "@arcjet/guard";
import type { PolicyInputMap } from "@arcjet/guard";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const saveNoteInput = z.object({
  orderId: z.string(),
  note: z.string(),
});

const saveNote = new FunctionTool({
  name: "save_note",
  description: "Save a free-text note on an order",
  parameters: saveNoteInput,
  execute: ({ orderId, note }) => ({ orderId, note }),
});

const agent = new LlmAgent({
  name: "support_agent",
  model: "gemini-flash-latest",
  instruction: "Save the note the user dictates.",
  tools: [saveNote],
});

// The plugin gates every tool, so select the PHI policy and map the note
// only for `save_note`.
export const runner = new InMemoryRunner({
  agent,
  appName: "support",
  plugins: [
    guardPlugin(arcjet, {
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
    }),
  ],
});
