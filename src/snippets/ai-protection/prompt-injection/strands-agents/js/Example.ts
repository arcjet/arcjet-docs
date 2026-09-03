import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { strandsAgentContext } from "@arcjet/guard/strands-agents/v1";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

export async function screenPrompt(conversationId: string, userText: string) {
  const invocationState = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...strandsAgentContext({ invocationState }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Prompt injection detected – rephrase your message");
  }
}
