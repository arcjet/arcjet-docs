import { query, tool } from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardHooks, guardTool } from "@arcjet/guard/claude-agent-sdk/v0";
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

export function emailTools(user: {
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
}) {
  const getClientRecord = tool(
    "get_client_record",
    "Get the account details on file for the current customer",
    {},
    async () => ({
      content: [{ type: "text", text: JSON.stringify(user.record) }],
    }),
  );

  // This adapter accepts action and rules. It doesn't accept
  // inputs.
  const sendEmail = guardTool(
    arcjet,
    tool(
      "send_email",
      "Send an email",
      {
        recipient: z.string(),
        body: z.string(),
      },
      async ({ recipient, body }) => {
        await emailProvider.send({ to: recipient, body });
        return {
          content: [{ type: "text", text: "sent" }],
        };
      },
    ),
    {
      action: "email.sent",
      rules: ({ body }) => [detectPii(body)],
    },
  );

  return { getClientRecord, sendEmail };
}

export async function runEmailAgent(
  sessionId: string,
  prompt: string,
) {
  for await (const message of query({
    prompt,
    options: {
      sessionId,
      hooks: guardHooks(arcjet, { sessionId }),
    },
  })) {
    void message;
  }
}
