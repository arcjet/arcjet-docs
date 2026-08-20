import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/vercel-ai/v7";
import { tool } from "ai";
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
    description: "Complete a user prompt",
    inputSchema: z.object({ prompt: z.string(), estimatedTokens: z.number() }),
    execute: async ({ prompt }) => ({ prompt }),
  }),
  {
    action: "prompt.completed",
    actor: "user123", // Replace with your authenticated user ID
    rules: (input) => [
      tokenBudget({
        key: "user123", // Replace with your authenticated user ID
        requested: Math.max(1, Math.ceil(input.estimatedTokens)),
      }),
    ],
  },
);
