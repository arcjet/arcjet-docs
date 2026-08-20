import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/vercel-eve/v0";
import { defineTool } from "eve/tools";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const tokenBudget = tokenBucket({
  bucket: "ai-tokens",
  refillRate: 2000,
  intervalSeconds: 3600,
  maxTokens: 5000,
});

export default guardTool(
  arcjet,
  defineTool({
    description: "Complete a user prompt",
    inputSchema: z.object({
      prompt: z.string(),
      estimatedTokens: z.number(),
    }),
    async execute(input) {
      return { prompt: input.prompt };
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
