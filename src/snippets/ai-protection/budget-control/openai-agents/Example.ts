import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/openai-agents/v0";
import { tool } from "@openai/agents";
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
  tool({
    name: "complete_prompt",
    description: "Complete a user prompt",
    parameters: z.object({
      prompt: z.string(),
      estimatedTokens: z.number(),
    }),
    execute: async ({ prompt }) => ({ prompt }),
  }),
  {
    action: "prompt.completed",
    rules: (input) => [
      tokenBudget({
        key: "user123",
        requested: Math.max(1, Math.ceil(input.estimatedTokens)),
      }),
    ],
  },
);
