import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { tanstackAiContext } from "@arcjet/guard/tanstack-ai/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

export async function screenPrompt(conversationId: string, userText: string) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...tanstackAiContext({ context: appContext }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Prompt injection detected – rephrase your message");
  }
}
