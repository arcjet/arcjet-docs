import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/strands-agents/v1";
import { tool } from "@strands-agents/sdk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const detectPii = localDetectSensitiveInfo({
  deny: ["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
});

export const saveNote = guardTool(
  arcjet,
  tool({
    name: "save_note",
    description: "Save a free-text note on an order",
    inputSchema: z.object({ orderId: z.string(), note: z.string() }),
    callback: ({ orderId, note }) => ({ orderId, note }),
  }),
  {
    action: "note.saved",
    rules: (input: { note: string }) => [detectPii(input.note)],
  },
);
