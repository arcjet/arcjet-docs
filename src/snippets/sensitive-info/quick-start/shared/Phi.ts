import { launchArcjet, policyInput } from "@arcjet/guard";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

// Call this before you store the note or pass it to a model.
export async function screenNote(userId: string, note: string) {
  const decision = await arcjet.guard({
    label: "note.saved",
    actor: userId,
    // Arcjet's server-side detector reads the note for PHI.
    inputs: { note: policyInput.server.string(note) },
  });

  // Deny detected PHI and checks that Arcjet couldn't complete.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Remove health identifiers from the note");
  }
}
