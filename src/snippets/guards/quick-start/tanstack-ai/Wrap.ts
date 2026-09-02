import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { chat, toolDefinition } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
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

const sendEmailInput = z.object({
  recipient: z.string(),
  body: z.string(),
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
  const getClientRecord = toolDefinition({
    name: "get_client_record",
    description:
      "Get the account details on file for the current customer",
    inputSchema: z.object({}),
  }).server(() => user.record);

  const sendEmail = toolDefinition({
    name: "send_email",
    description: "Send an email",
    inputSchema: sendEmailInput,
  }).server(({ recipient, body }) =>
    emailProvider.send({ to: recipient, body }),
  );

  const appContext = { sessionId: user.id };

  // This adapter accepts action and rules. It doesn't accept
  // inputs. There is no guardTool.
  return chat({
    adapter: openaiText("gpt-4o-mini"),
    messages: [{ role: "user", content: prompt }],
    tools: [getClientRecord, sendEmail],
    context: appContext,
    stream: false,
    middleware: [
      guardMiddleware(arcjet, {
        sessionId: user.id,
        action: ({ toolName }) =>
          toolName === "send_email" ? "email.sent" : "tool.invoked",
        rules: ({ toolName, input }) => {
          if (toolName !== "send_email") {
            return [];
          }
          const { body } = sendEmailInput.parse(input);
          return [detectPii(body)];
        },
      }),
    ],
  });
}
