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

  if (
    decision.conclusion === "DENY" &&
    decision.reason === "MODERATE_CONTENT"
  ) {
    throw new Error("Harmful content detected – rephrase your message");
  }
}
