import { openai } from "@ai-sdk/openai";
import arcjet, { detectPromptInjection, shield } from "@arcjet/next";
import type { UIMessage } from "ai";
import { convertToModelMessages, isTextUIPart, streamText } from "ai";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your Arcjet key from https://console.arcjet.com
  rules: [
    // Shield protects against common web attacks such as SQL injection
    shield({ mode: "LIVE" }),
    // Detect prompt injection attacks before they reach your AI model
    detectPromptInjection({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
    }),
  ],
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Check the most recent user message for prompt injection.
  // Pass the full conversation if you want to scan all messages.
  const lastMessage: string = (messages.at(-1)?.parts ?? [])
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join(" ");

  const decision = await aj.protect(req, {
    detectPromptInjectionMessage: lastMessage,
  });

  // Deny detected prompt injections, text over 128 KiB, and any other denial.
  if (decision.isDenied()) {
    if (decision.reason.isPromptInjection()) {
      console.warn("Request blocked due to prompt injection");
      return new Response("Prompt injection detected – rephrase your message", {
        status: 403,
      });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Fail closed when Arcjet couldn't complete the check.
  if (decision.isErrored()) {
    console.warn("Arcjet error", decision.reason.message);
    return new Response("Service unavailable", { status: 503 });
  }

  // Arcjet approved – call your AI provider
  const result = await streamText({
    model: openai("gpt-4o"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
