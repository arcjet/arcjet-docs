import { launchArcjet, moderateContent } from "@arcjet/guard";
import { generateText } from "ai";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function runAgent(prompt: string) {
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(prompt)],
  });

  if (decision.conclusion === "DENY" && decision.reason === "MODERATE_CONTENT") {
    throw new Error("Harmful content detected – rephrase your message");
  }

  return generateText({ model: "openai/gpt-4o-mini", prompt });
}
