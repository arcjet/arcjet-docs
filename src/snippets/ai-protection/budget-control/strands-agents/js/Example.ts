import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/strands-agents/v1";
import { tool } from "@strands-agents/sdk";
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
    inputSchema: z.object({
      prompt: z.string(),
      estimatedTokens: z.number(),
    }),
    callback: ({ prompt }) => ({ prompt }),
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
