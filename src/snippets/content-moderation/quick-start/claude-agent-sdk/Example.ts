import { query } from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, moderateContent } from "@arcjet/guard";
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
          // The wrapper fails closed by default. Arcjet denies text over 128 KiB and
          // moderates the first 60 KB, adding an AJ1142 warning for longer text.
          rules: ({ prompt }) => [moderateContent()(prompt)],
        },
      }),
    },
  })) {
    void message;
  }
}
