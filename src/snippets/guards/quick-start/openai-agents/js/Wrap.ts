import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardTool } from "@arcjet/guard/openai-agents/v0";
import { Agent, run, tool } from "@openai/agents";
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

  // This adapter accepts action and rules. It doesn't accept
  // inputs.
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
      rules: ({ body }) => [detectPii(body)],
    },
  );

  const agent = new Agent({
    name: "support-agent",
    instructions:
      "Use get_client_record when the user asks for account " +
      "details. Use send_email exactly once to complete the " +
      "request.",
    tools: [getClientRecord, sendEmail],
  });

  return run(agent, prompt, { context: { sessionId: user.id } });
}
