// This example is adapted from https://sdk.vercel.ai/docs/guides/frameworks/nextjs-app
import { env } from "$env/dynamic/private";
import { openai } from "@ai-sdk/openai";
import arcjet, { tokenBucket } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";
import { streamText } from "ai";
import { promptTokensEstimate } from "openai-chat-tokens";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com
  // and set it as an environment variable rather than hard coding.
  // See: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
  key: env.AJ_KEY!,
  characteristics: ["ip.src"], // track requests by IP address
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      refillRate: 2_000,
      interval: "1h",
      capacity: 5_000,
    }),
  ],
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(event: RequestEvent) {
  const { messages } = await event.request.json();

  // Estimate the number of tokens required to process the request
  const estimate = promptTokensEstimate({
    messages,
  });

  console.log("Token estimate", estimate);

  // Withdraw tokens from the token bucket
  const decision = await aj.protect(event, { requested: estimate });
  console.log("Arcjet decision", decision.conclusion);

  if (decision.reason.isRateLimit()) {
    console.log("Requests remaining", decision.reason.remaining);
  }

  // If the request is denied, return an error
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return error(429, { message: "Too many requests" });
    } else {
      return error(403, { message: "Forbidden" });
    }
  }

  // If the request is allowed, continue to use OpenAI
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages,
  });

  return result.toDataStreamResponse();
}
