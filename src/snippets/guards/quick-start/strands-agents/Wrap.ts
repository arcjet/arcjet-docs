import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardHooks, guardTool } from "@arcjet/guard/strands-agents/v1";
import { Agent, tool } from "@strands-agents/sdk";
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
    description:
      "Get the account details on file for the current customer",
    inputSchema: z.object({}),
    callback: () => user.record,
  });

  // This adapter accepts action and rules. It doesn't accept
  // inputs.
  const sendEmail = guardTool(
    arcjet,
    tool({
      name: "send_email",
      description: "Send an email",
      inputSchema: z.object({
        recipient: z.string(),
        body: z.string(),
      }),
      callback: ({ recipient, body }) =>
        emailProvider.send({ to: recipient, body }),
    }),
    {
      action: "email.sent",
      rules: ({ body }) => [detectPii(body)],
    },
  );

  const agent = new Agent({
    tools: [getClientRecord, sendEmail],
    plugins: [guardHooks(arcjet, { sessionId: user.id })],
  });

  return agent.invoke(prompt, {
    invocationState: { sessionId: user.id },
  });
}
