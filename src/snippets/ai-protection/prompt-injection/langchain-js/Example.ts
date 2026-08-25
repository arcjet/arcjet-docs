import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { langchainContext } from "@arcjet/guard/langchain/v1";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

export async function screenPrompt(
  conversationId: string,
  userText: string,
) {
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...langchainContext({ configurable: { thread_id: conversationId } }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Prompt injection detected – rephrase your message");
  }
}
