import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import {
  claudeManagedAgentsContext,
  guardEvents,
} from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();

// sessionId is the Anthropic session `id` from
// `client.beta.sessions.create`. conversationId is your own id, which is
// what Arcjet correlates on.
export async function sendTurn(
  sessionId: string,
  conversationId: string,
  userText: string,
) {
  // guardEvents screens the turn and only then sends it, so an injected
  // prompt never reaches the session.
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
      context: claudeManagedAgentsContext({ correlationId: conversationId }),
    },
    (body) => client.beta.sessions.events.send(sessionId, body),
  );

  if (!inbound.allowed) {
    throw new Error(inbound.message);
  }
}
