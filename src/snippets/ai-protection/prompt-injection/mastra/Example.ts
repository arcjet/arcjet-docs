import { launchArcjet, detectPromptInjection } from "@arcjet/guard";
import { guardProcessor } from "@arcjet/guard/mastra/v1";
import { Agent } from "@mastra/core/agent";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const inbound = guardProcessor(arcjet, {
  action: "message.received",
  rules: ({ text }) => [detectPromptInjection()(text)],
});

export const agent = new Agent({
  id: "support-agent",
  name: "support-agent",
  instructions: "Help the user.",
  model: "openai/gpt-4o-mini",
  inputProcessors: [inbound],
});
