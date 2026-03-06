import { openai } from "@ai-sdk/openai";
import arcjet, { detectBot, shield } from "@arcjet/next";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects against common web attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Block all automated clients — bots inflate AI costs
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      allow: [], // Block all bots. See https://arcjet.com/bot-list
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return new Response("Automated clients are not permitted", {
        status: 403,
      });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Arcjet approved - now read the body and call your AI provider
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
