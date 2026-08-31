import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardTool } from "@arcjet/guard/langgraph/v1";
import { tool } from "@langchain/core/tools";
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
  id: string;
  allowedRecipients: string[];
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
}) {
  const getClientRecord = tool(async () => user.record, {
    name: "get_client_record",
    description:
      "Get the account details on file for the current customer",
    schema: z.object({}),
  });

  // This adapter accepts action and rules. It doesn't accept
  // inputs.
  const sendEmail = guardTool(
    arcjet,
    tool(
      async ({ recipient, body }) =>
        emailProvider.send({ to: recipient, body }),
      {
        name: "send_email",
        description: "Send an email",
        schema: z.object({
          recipient: z.string().email(),
          body: z.string(),
        }),
      },
    ),
    {
      action: "email.sent",
      rules: ({ body }) => [detectPii(body)],
    },
  );

  return [getClientRecord, sendEmail];
}
