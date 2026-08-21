import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/genkit/v1";
import { genkit, z } from "genkit";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const ai = genkit({
  // Configure your model plugin.
});

const tokenBudget = tokenBucket({
  bucket: "ai-tokens",
  refillRate: 2000,
  intervalSeconds: 3600,
  maxTokens: 5000,
});

export const completePrompt = guardTool(
  arcjet,
  ai.defineTool(
    {
      name: "complete_prompt",
      description: "Complete a user prompt",
      inputSchema: z.object({
        prompt: z.string(),
        estimatedTokens: z.number(),
      }),
    },
    async ({ prompt }) => ({ prompt }),
  ),
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
