import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardTool } from "@arcjet/guard/vercel-eve/v0";
import { defineTool } from "eve/tools";
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
  const getClientRecord = defineTool({
    description:
      "Get the account details on file for the current customer",
    inputSchema: z.object({}),
    async execute() {
      return user.record;
    },
  });

  // On DENY, Eve projects a throw as a failed action.result. Pass
  // onDeny: "result" so the model can read the denial payload.
  // This adapter accepts action and rules. It doesn't accept
  // inputs.
  const sendEmail = guardTool(
    arcjet,
    defineTool({
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
      onDeny: "result",
      rules: ({ body }) => [detectPii(body)],
    },
  );

  return { getClientRecord, sendEmail };
}
