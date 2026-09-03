import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/langchain/v1";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const tokenBudget = tokenBucket({
  bucket: "ai-tokens",
  refillRate: 2000,
  intervalSeconds: 3600,
  maxTokens: 5000,
});

export const completePrompt = guardTool(
  arcjet,
  tool(async ({ prompt }) => ({ prompt }), {
    name: "complete_prompt",
    description: "Complete a user prompt",
    schema: z.object({
      prompt: z.string(),
      estimatedTokens: z.number(),
    }),
  }),
  {
    action: "prompt.completed",
    rules: (input) => [
      tokenBudget({
        key: "user123", // Replace with your authenticated user ID
        requested: Math.max(1, Math.ceil(input.estimatedTokens)),
      }),
    ],
  },
);
