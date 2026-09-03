import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const tokenBudget = tokenBucket({
  bucket: "ai-tokens",
  refillRate: 2000,
  intervalSeconds: 3600,
  maxTokens: 5000,
});

const completePromptInput = z.object({
  prompt: z.string(),
  estimatedTokens: z.number(),
});

export const completePrompt = toolDefinition({
  name: "complete_prompt",
  description: "Complete a user prompt",
  inputSchema: completePromptInput,
}).server(({ prompt }) => ({ prompt }));

export const middleware = guardMiddleware(arcjet, {
  action: "prompt.completed",
  rules: ({ toolName, input }) => {
    if (toolName !== "complete_prompt") {
      return [];
    }
    const { estimatedTokens } = completePromptInput.parse(input);
    return [
      tokenBudget({
        key: "user123", // Replace with your authenticated user ID
        requested: Math.max(1, Math.ceil(estimatedTokens)),
      }),
    ];
  },
});
