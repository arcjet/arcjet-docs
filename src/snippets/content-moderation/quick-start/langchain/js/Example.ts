import { launchArcjet, moderateContent } from "@arcjet/guard";
import { langchainContext } from "@arcjet/guard/langchain/v1";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function screenPrompt(conversationId: string, userText: string) {
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(userText)],
    ...langchainContext({ configurable: { thread_id: conversationId } }),
  });

  // Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
  // complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
  // decision.warnings for longer text. To moderate all of it, split it up.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Harmful content detected – rephrase your message");
  }
}
