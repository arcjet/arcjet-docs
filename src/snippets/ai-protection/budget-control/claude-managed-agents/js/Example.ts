import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, tokenBucket } from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
} from "@arcjet/guard/claude-managed-agents/v0";
import type { AgentCustomToolUseEvent } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();

const tokenBudget = tokenBucket({
  bucket: "ai-tokens",
  refillRate: 2000,
  intervalSeconds: 3600,
  maxTokens: 5000,
});

export function completePrompt(
  event: AgentCustomToolUseEvent,
  sessionId: string,
  conversationId: string,
) {
  return guardCustomTool(
    arcjet,
    {
      event,
      execute: async (input) => ({ prompt: String(input.prompt) }),
      send: (result) =>
        client.beta.sessions.events.send(sessionId, { events: [result] }),
    },
    {
      action: "prompt.completed",
      rules: (input) => [
        tokenBudget({
          key: "user123", // Replace with your authenticated user ID
          requested: Math.max(1, Math.ceil(Number(input.estimatedTokens))),
        }),
      ],
      // Correlation is your own conversation id, never the Anthropic
      // session id.
      context: claudeManagedAgentsContext({ correlationId: conversationId }),
    },
  );
}
