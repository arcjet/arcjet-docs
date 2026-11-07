import { launchArcjet, moderateContent } from "@arcjet/guard";
import { guardProcessor } from "@arcjet/guard/mastra/v1";
import { Agent } from "@mastra/core/agent";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const inbound = guardProcessor(arcjet, {
  action: "message.received",
  // The wrapper fails closed by default. Arcjet denies text over 128 KiB and
  // moderates the first 60 KB, adding an AJ1142 warning for longer text.
  rules: ({ text }) => [moderateContent()(text)],
});

export const agent = new Agent({
  id: "support-agent",
  name: "support-agent",
  instructions: "Help the user.",
  model: "openai/gpt-4o-mini",
  inputProcessors: [inbound],
});
