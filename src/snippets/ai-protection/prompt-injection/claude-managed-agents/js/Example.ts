import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { guardEvents } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const client = new Anthropic();

// Pass the Anthropic session `id` from `client.beta.sessions.create`.
export async function sendTurn(sessionId: string, userText: string) {
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
