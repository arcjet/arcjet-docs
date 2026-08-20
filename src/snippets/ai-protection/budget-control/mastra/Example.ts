import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/mastra/v1";
import { createTool } from "@mastra/core/tools";
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
  createTool({
    id: "complete-prompt",
    description: "Complete a user prompt",
    inputSchema: z.object({
      prompt: z.string(),
      estimatedTokens: z.number(),
    }),
    async execute({ prompt }) {
      return { prompt };
    },
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
