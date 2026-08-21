import { launchArcjet, moderateContent } from "@arcjet/guard";
import { genkitContext } from "@arcjet/guard/genkit/v1";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function screenPrompt(
  conversationId: string,
  userText: string,
) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(userText)],
    ...genkitContext({ context: appContext }),
  });

  if (decision.conclusion === "DENY" && decision.reason === "MODERATE_CONTENT") {
    throw new Error("Harmful content detected – rephrase your message");
  }
}
