import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/genkit/v1";
import { genkit, z } from "genkit";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const ai = genkit({
  // Configure your model plugin.
});
const detectPii = localDetectSensitiveInfo();

export const saveNote = guardTool(
  arcjet,
  ai.defineTool(
    {
      name: "save_note",
      description: "Save a free-text note on an order",
      inputSchema: z.object({ orderId: z.string(), note: z.string() }),
    },
    async ({ orderId, note }) => ({ orderId, note }),
  ),
  {
    action: "note.saved",
    rules: (input) => [detectPii(input.note)],
  },
);
