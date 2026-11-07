import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { guardInbound } from "@arcjet/guard/vercel-eve/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export async function screenInbound(
  message: string,
  conversationId: string,
) {
  const verdict = await guardInbound(arcjet, message, {
    action: "message.received",
    correlationId: conversationId,
    // The wrapper fails closed by default, and Arcjet denies text over 128 KiB.
    rules: [detectPromptInjection()(message)],
  });

  if (!verdict.allowed) {
    throw new Error("Prompt injection detected – rephrase your message");
  }
}
