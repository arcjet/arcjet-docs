import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
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
  async (input: { orderId: string }) => {
    return { orderId: input.orderId, status: "shipped" };
  },
  {
    action: "order.looked-up",
    rules: (input) => [lookupLimit({ key: input.orderId, requested: 1 })],
  },
);

export async function runAgent(sessionId: string, userText: string) {
  await guardEvents(arcjet, {
    sessionId,
    inbound: {
      action: "message.received",
      rules: ({ prompt }) => [detectPromptInjection()(prompt)],
    },
    prompt: userText,
  });

  const stream = await client.beta.sessions.events.stream(sessionId);
  await client.beta.sessions.events.send(sessionId, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: userText }],
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "agent.custom_tool_use") {
      const result = await lookupOrder(event.input);
      await client.beta.sessions.events.send(sessionId, {
        events: [
          {
            type: "user.custom_tool_result",
            custom_tool_use_id: event.id,
            content: [{ type: "text", text: JSON.stringify(result) }],
          },
        ],
      });
    }
  }
}
