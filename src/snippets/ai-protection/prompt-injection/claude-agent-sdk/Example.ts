import { query } from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { guardHooks } from "@arcjet/guard/claude-agent-sdk/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export async function runAgent(sessionId: string, userText: string) {
  for await (const message of query({
    prompt: userText,
    options: {
      sessionId,
      hooks: guardHooks(arcjet, {
        sessionId,
        inbound: {
          action: "message.received",
          rules: ({ prompt }) => [detectPromptInjection()(prompt)],
        },
      }),
    },
  })) {
    void message;
  }
}
