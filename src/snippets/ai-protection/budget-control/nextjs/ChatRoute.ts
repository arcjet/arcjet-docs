import { openai } from "@ai-sdk/openai";
import arcjet, { tokenBucket } from "@arcjet/next";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  // Track budgets per user — replace "userId" with any stable identifier
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      refillRate: 2_000, // Refill 2,000 tokens per hour
      interval: "1h",
      capacity: 5_000, // Maximum 5,000 tokens in the bucket
    }),
  ],
});

export async function POST(req: Request) {
  // Replace with your session/auth lookup to get a stable user ID
  const userId = "user-123";
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  // Estimate token cost: ~1 token per 4 characters of text (rough heuristic).
  // For accurate counts use https://www.npmjs.com/package/tiktoken
  const totalChars = modelMessages.reduce((sum, m) => {
    const content =
      typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    return sum + content.length;
  }, 0);
  const estimate = Math.ceil(totalChars / 4);

  // Deduct the estimated tokens from the user's budget
  const decision = await aj.protect(req, { userId, requested: estimate });

  if (decision.isDenied()) {
    return new Response("AI usage limit exceeded", { status: 429 });
  }

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
