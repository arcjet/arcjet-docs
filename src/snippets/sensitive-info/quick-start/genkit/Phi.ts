import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/genkit/v1";
import { genkit, z } from "genkit";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

// Before the agent runs: reject a note that carries PHI, so the model never
// receives it.
export async function screenNote(userId: string, note: string) {
  const decision = await arcjet.guard({
    label: "note.saved",
    actor: userId,
    inputs: { note: policyInput.server.string(note) },
  });

  // A direct call fails open, so reject failed-open decisions as well.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Remove health identifiers from the note");
  }
}
const ai = genkit({
  // Configure your model plugin.
});

// When the agent calls the tool: stop the tool if its note carries PHI.
// The model has already read this text.
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
    // Arcjet's server-side detector reads the note for PHI.
    inputs: (input: { note: string }) => ({
      note: policyInput.server.string(input.note),
    }),
  },
);
