import Anthropic from "@anthropic-ai/sdk";
import {
  launchArcjet,
  detectPromptInjection,
  tokenBucket,
} from "@arcjet/guard";
import {
  guardCustomTool,
  guardEvents,
} from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

export const lookupOrder = guardCustomTool(
  arcjet,
  async ({ orderId }: { orderId: string }) => ({
    orderId,
    status: "shipped",
  }),
  {
    action: "order.looked-up",
    rules: ({ orderId }) => [lookupLimit({ key: orderId, requested: 5 })],
  },
);

export async function sendTurn(sessionId: string, userText: string) {
  // Screen the prompt before you send `user.message`. On `DENY`, don't send
  // the event: the model never sees the prompt.
  await guardEvents(arcjet, {
    sessionId,
    inbound: {
      action: "message.received",
      rules: ({ prompt }) => [detectPromptInjection()(prompt)],
    },
    prompt: userText,
  });

  await client.beta.sessions.events.send(sessionId, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: userText }],
      },
    ],
  });
}
