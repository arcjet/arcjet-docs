import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { generateText } from "ai";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

export async function runAgent(userId: string, prompt: string) {
  const decision = await arcjet.guard({
    label: "message.received",
    actor: userId,
    rules: [inbound(prompt)],
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Prompt injection detected – rephrase your message");
  }

  return generateText({
    model: "openai/gpt-4o-mini",
    prompt,
  });
}
