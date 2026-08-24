import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/langchain/v1";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const detectPii = localDetectSensitiveInfo();

export const saveNote = guardTool(
  arcjet,
  tool(
    async ({ orderId, note }) => ({ orderId, note }),
    {
      name: "save_note",
      description: "Save a free-text note on an order",
      schema: z.object({ orderId: z.string(), note: z.string() }),
    },
  ),
  {
    action: "note.saved",
    rules: (input) => [detectPii(input.note)],
  },
);
