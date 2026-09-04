import Anthropic from "@anthropic-ai/sdk";
import {
  launchArcjet,
  detectPromptInjection,
  tokenBucket,
} from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
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

async function lookupOrder(input: { [key: string]: unknown }) {
  return { orderId: String(input.orderId), status: "shipped" };
}

export async function runAgent(
  conversationId: string,
  sessionId: string,
  userText: string,
) {
  // Correlation is your own conversation id, never the Anthropic session id.
  const context = claudeManagedAgentsContext({
    correlationId: conversationId,
  });

  const stream = await client.beta.sessions.events.stream(sessionId);

  // Anthropic runs the tool loop, so there is no PreToolUse hook. This
  // screens the prompt and sends it only if the guard allows.
  const inbound = await guardEvents(
    arcjet,
    {
      events: [
        { type: "user.message", content: [{ type: "text", text: userText }] },
      ],
      inbound: {
        action: "message.received",
        rules: ({ text }) => [detectPromptInjection()(text)],
      },
      context,
    },
    (body) => client.beta.sessions.events.send(sessionId, body),
  );
  if (!inbound.allowed) {
    throw new Error(inbound.message);
  }

  for await (const event of stream) {
    if (event.type === "agent.custom_tool_use") {
      // On deny, guardCustomTool sends the error result itself and
      // lookupOrder never runs.
      const gated = await guardCustomTool(
        arcjet,
        {
          event,
          execute: lookupOrder,
          send: (result) =>
            client.beta.sessions.events.send(sessionId, { events: [result] }),
        },
        {
          action: "order.looked-up",
          rules: (input) => [
            lookupLimit({ key: String(input.orderId), requested: 1 }),
          ],
          context,
        },
      );

      if (gated.allowed) {
        await client.beta.sessions.events.send(sessionId, {
          events: [
            {
              type: "user.custom_tool_result",
              custom_tool_use_id: event.id,
              content: [{ type: "text", text: JSON.stringify(gated.output) }],
            },
          ],
        });
      }
    }
  }
}
