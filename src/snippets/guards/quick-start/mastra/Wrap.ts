import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardTool } from "@arcjet/guard/mastra/v1";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Create one Arcjet client and reuse it across agent runs. Rampart
// detects bank account and routing numbers locally.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend: rampart(),
});
const detectPii = localDetectSensitiveInfo({
  deny: ["BANK_ACCOUNT", "ROUTING_NUMBER"],
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
    description:
      "Get the account details on file for the current customer",
    inputSchema: z.object({}),
    async execute() {
      return user.record;
    },
  });

  // This adapter accepts action and rules. It doesn't accept
  // inputs.
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
      "Use get-client-record when the user asks for account " +
      "details. Use send-email exactly once to complete the " +
      "request.",
    model: "openai/gpt-4o-mini",
    tools: { getClientRecord, sendEmail },
  });
}
