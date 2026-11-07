import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { langgraphAgentContext } from "@arcjet/guard/langgraph/v1";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

export async function screenPrompt(conversationId: string, userText: string) {
  const config = { configurable: { thread_id: conversationId } };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...langgraphAgentContext(config),
  });

  // Deny detected prompt injections, text over 128 KiB, and checks that
  // Arcjet couldn't complete.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Prompt injection detected – rephrase your message");
  }
}
