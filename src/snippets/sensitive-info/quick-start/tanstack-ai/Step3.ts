import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const detectPii = localDetectSensitiveInfo({
  deny: ["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
});

const saveNoteInput = z.object({
  orderId: z.string(),
  note: z.string(),
});

export const saveNote = toolDefinition({
  name: "save_note",
  description: "Save a free-text note on an order",
  inputSchema: saveNoteInput,
}).server(({ orderId, note }) => ({ orderId, note }));

// There is no `guardTool`. Scan the free-text `note` in the middleware and
// leave the opaque `orderId` out of the detector.
export const middleware = guardMiddleware(arcjet, {
  action: "note.saved",
  rules: ({ toolName, input }) => {
    if (toolName !== "save_note") {
      return [];
    }
    const { note } = saveNoteInput.parse(input);
    return [detectPii(note)];
  },
});
