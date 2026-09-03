import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
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

const completePrompt = new FunctionTool({
  name: "complete_prompt",
  description: "Complete a user prompt",
  parameters: completePromptInput,
  execute: ({ prompt }) => ({ prompt }),
});

const agent = new LlmAgent({
  name: "support_agent",
  model: "gemini-flash-latest",
  instruction: "Complete the user prompt.",
  tools: [completePrompt],
});

export const runner = new InMemoryRunner({
  agent,
  appName: "support",
  plugins: [
    guardPlugin(arcjet, {
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
    }),
  ],
});
