import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardTool } from "@arcjet/guard/mastra/v1";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
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

export function createEmailAgent(user: {
  id: string;
  allowedRecipients: string[];
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
}) {
  const getClientRecord = createTool({
    id: "get-client-record",
    description: "Get the account details on file for the current customer",
    inputSchema: z.object({}),
    async execute() {
      return user.record;
    },
  });

  const sendEmail = guardTool(
    arcjet,
    createTool({
      id: "send-email",
      description: "Send an email",
      inputSchema: z.object({
        recipient: z.string(),
        body: z.string(),
      }),
      async execute({ recipient, body }) {
        return emailProvider.send({ to: recipient, body });
      },
    }),
    {
      action: "email.sent",
      rules: ({ body }) => [detectPii(body)],
    },
  );

  return new Agent({
    id: "support-agent",
    name: "support-agent",
    instructions:
      "You are a support desk assistant. Use get-client-record when the " +
      "request needs account details. Use send-email exactly once to " +
      "complete the request. Never ask a follow-up question. Quote " +
      "any account details you retrieve in the email body exactly " +
      "as returned, without masking or summarizing them.",
    model: "openai/gpt-4o-mini",
    tools: { getClientRecord, sendEmail },
  });
}
