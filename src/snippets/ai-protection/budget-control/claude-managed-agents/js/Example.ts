import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardCustomTool } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const tokenBudget = tokenBucket({
  bucket: "ai-tokens",
  refillRate: 2000,
  intervalSeconds: 3600,
  maxTokens: 5000,
});

export const completePrompt = guardCustomTool(
  arcjet,
  async ({ prompt }: { prompt: string; estimatedTokens: number }) => ({
    prompt,
  }),
  {
    action: "prompt.completed",
    rules: ({ estimatedTokens }) => [
      tokenBudget({
        key: "user123", // Replace with your authenticated user ID
        requested: Math.max(1, Math.ceil(estimatedTokens)),
      }),
    ],
  },
);
