import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const detectPii = localDetectSensitiveInfo();

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

// There is no `guardTool`. Scan the free-text `note` in the plugin and leave
// the opaque `orderId` out of the detector.
export const runner = new InMemoryRunner({
  agent,
  appName: "support",
  plugins: [
    guardPlugin(arcjet, {
      action: "note.saved",
      rules: ({ toolName, input }) => {
        if (toolName !== "save_note") {
          return [];
        }
        const { note } = saveNoteInput.parse(input);
        return [detectPii(note)];
      },
    }),
  ],
});
