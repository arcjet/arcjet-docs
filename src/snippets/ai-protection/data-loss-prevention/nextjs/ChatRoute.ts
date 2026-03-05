import { openai } from "@ai-sdk/openai";
import arcjet, { sensitiveInfo } from "@arcjet/next";
import type { UIMessage } from "ai";
import { convertToModelMessages, isTextUIPart, streamText } from "ai";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block PII types that should never appear in AI prompts.
      // Remove types your app legitimately handles (e.g. EMAIL for a support bot).
      deny: ["CREDIT_CARD_NUMBER", "EMAIL"],
    }),
  ],
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Check the most recent user message for sensitive information.
  // Pass the full conversation if you want to scan all messages.
  const lastMessage: string = (messages.at(-1)?.parts ?? [])
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join(" ");

  const decision = await aj.protect(req, { sensitiveInfoValue: lastMessage });

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    console.warn("Request blocked due to sensitive information");
    return new Response(
      "Sensitive information detected — please remove it from your prompt",
      { status: 400 },
    );
  }

  // Arcjet approved — call your AI provider
  const result = await streamText({
    model: openai("gpt-4o"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
