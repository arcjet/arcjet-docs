import { launchArcjet, moderateContent } from "@arcjet/guard";
import { langgraphAgentContext } from "@arcjet/guard/langgraph/v1";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function screenPrompt(
  conversationId: string,
  userText: string,
) {
  const config = { configurable: { thread_id: conversationId } };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(userText)],
    ...langgraphAgentContext(config),
  });

  if (decision.conclusion === "DENY" && decision.reason === "MODERATE_CONTENT") {
    throw new Error("Harmful content detected – rephrase your message");
  }
}
