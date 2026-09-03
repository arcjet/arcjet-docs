import { launchArcjet, moderateContent } from "@arcjet/guard";
import { strandsAgentContext } from "@arcjet/guard/strands-agents/v1";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function screenPrompt(conversationId: string, userText: string) {
  const invocationState = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(userText)],
    ...strandsAgentContext({ invocationState }),
  });

  if (
    decision.conclusion === "DENY" &&
    decision.reason === "MODERATE_CONTENT"
  ) {
    throw new Error("Harmful content detected – rephrase your message");
  }
}
