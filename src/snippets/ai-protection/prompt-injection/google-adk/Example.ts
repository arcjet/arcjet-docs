import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { googleAdkContext } from "@arcjet/guard/google-adk/v2";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

export async function screenPrompt(conversationId: string, userText: string) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...googleAdkContext(appContext),
  });

  // Deny detected prompt injections, text over 128 KiB, and checks that
  // Arcjet couldn't complete.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Prompt injection detected – rephrase your message");
  }
}
