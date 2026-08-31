import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardMiddleware, guardTool } from "@arcjet/guard/genkit/v1";
import { genkit, z } from "genkit";

// Create one Arcjet client and reuse it across agent runs. Rampart
// detects bank account and routing numbers locally.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend: rampart(),
});
const ai = genkit({
  // Configure your model plugin.
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
  const getClientRecord = ai.defineTool(
    {
      name: "get_client_record",
      description:
        "Get the account details on file for the current customer",
      inputSchema: z.object({}),
    },
    async () => user.record,
  );

  // This adapter accepts action and rules. It doesn't accept
  // inputs.
  const sendEmail = guardTool(
    arcjet,
    ai.defineTool(
      {
        name: "send_email",
        description: "Send an email",
        inputSchema: z.object({
          recipient: z.string(),
          body: z.string(),
        }),
      },
      async ({ recipient, body }) =>
        emailProvider.send({ to: recipient, body }),
    ),
    {
      action: "email.sent",
      rules: ({ body }) => [detectPii(body)],
    },
  );

  return ai.generate({
    prompt,
    tools: [getClientRecord, sendEmail],
    use: [guardMiddleware(arcjet, { sessionId: user.id })],
    context: { sessionId: user.id },
  });
}
