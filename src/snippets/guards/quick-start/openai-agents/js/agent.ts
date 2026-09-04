import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardTool } from "@arcjet/guard/openai-agents/v0";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

// Placeholder for your mail transport.
const emailProvider = {
  send: async (_: { to: string; body: string }) => ({ ok: true }),
};

// Rampart detects bank account and routing numbers on this machine. The
// rule needs its own reference to it, so share one instance: entity types
// outside the default set throw unless the rule has a backend.
const sensitiveInfoBackend = rampart();

// Create one Arcjet client and reuse it across agent runs.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend,
});
const detectPii = localDetectSensitiveInfo({
  deny: ["BANK_ACCOUNT", "ROUTING_NUMBER"],
  backend: sensitiveInfoBackend,
});

export async function runEmailAgent(
  user: {
    id: string;
    allowedRecipients: string[];
    record: {
      name: string;
      bankAccount: string;
      routingNumber: string;
    };
  },
  prompt: string,
) {
  const getClientRecord = tool({
    name: "get_client_record",
    description: "Get the account details on file for the current customer",
    parameters: z.object({}),
    execute: async () => user.record,
  });

  const sendEmail = guardTool(
    arcjet,
    tool({
      name: "send_email",
      description: "Send an email",
      parameters: z.object({
        recipient: z.string(),
        body: z.string(),
      }),
      execute: async ({ recipient, body }) =>
        emailProvider.send({ to: recipient, body }),
    }),
    {
      action: "email.sent",
      rules: (input: { body: string }) => [detectPii(input.body)],
    },
  );

  const agent = new Agent({
    name: "support-agent",
    instructions:
      "You are a support desk assistant. Use get_client_record when the " +
      "request needs account details. Use send_email exactly once to " +
      "complete the request. Never ask a follow-up question. Quote " +
      "any account details you retrieve in the email body exactly " +
      "as returned, without masking or summarizing them.",
    tools: [getClientRecord, sendEmail],
  });

  return run(agent, prompt, { context: { sessionId: user.id } });
}
