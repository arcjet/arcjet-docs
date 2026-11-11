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

  if (decision.conclusion === "DENY") {
    // The note carries PHI. Ask the user to remove it.
    throw new Error("Remove health identifiers from the note");
  }

  if (decision.hasFailedOpen()) {
    // Arcjet couldn't complete the check, so the call failed open. Reject the
    // note to fail closed, or log the error and continue to fail open.
    throw new Error("Couldn't check the note for PHI. Try again.");
  }
}
