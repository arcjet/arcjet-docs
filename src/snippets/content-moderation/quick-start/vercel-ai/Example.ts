import { launchArcjet, moderateContent } from "@arcjet/guard";
import { generateText } from "ai";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function runAgent(prompt: string) {
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(prompt)],
  });

  // Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
  // complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
  // decision.warnings for longer text. To moderate all of it, split it up.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Harmful content detected – rephrase your message");
  }

  return generateText({ model: "openai/gpt-4o-mini", prompt });
}
