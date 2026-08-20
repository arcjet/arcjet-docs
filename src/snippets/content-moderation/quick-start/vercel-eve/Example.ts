import { launchArcjet, moderateContent } from "@arcjet/guard";
import { guardInbound } from "@arcjet/guard/vercel-eve/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export async function screenInbound(
  message: string,
  conversationId: string,
) {
  const verdict = await guardInbound(arcjet, message, {
    action: "message.received",
    correlationId: conversationId,
    rules: [moderateContent()(message)],
  });

  if (!verdict.allowed) {
    throw new Error("Harmful content detected – rephrase your message");
  }
}
