import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { guardCustomTool } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const detectPii = localDetectSensitiveInfo();

// Anthropic runs built-in tools in its own environment, so a custom tool
// your app executes is the boundary you still hold.
export const saveNote = guardCustomTool(
  arcjet,
  async ({ orderId, note }: { orderId: string; note: string }) => ({
    orderId,
    note,
  }),
  {
    action: "note.saved",
    rules: ({ note }) => [detectPii(note)],
  },
);
