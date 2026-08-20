import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/mastra/v1";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const detectPii = localDetectSensitiveInfo();

export const saveNote = guardTool(
  arcjet,
  createTool({
    id: "save-note",
    description: "Save a free-text note on an order",
    inputSchema: z.object({ orderId: z.string(), note: z.string() }),
    async execute({ orderId, note }) {
      return { orderId, note };
    },
  }),
  {
    action: "note.saved",
    rules: (input) => [detectPii(input.note)],
  },
);
