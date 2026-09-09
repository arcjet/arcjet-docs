import { launchArcjet, policyInput } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
import { z } from "zod";

// Create one Arcjet client and reuse it across agent runs. Rampart
// evaluates the policy's LOCAL inputs on this machine, so the email body
// never leaves your application.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend: rampart(),
});

// Placeholder for your mail transport.
const emailProvider = {
  send: async (_: { to: string; body: string }) => ({ ok: true }),
};

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
  const getClientRecord = new FunctionTool({
    name: "get_client_record",
    description: "Get the account details on file for the current customer",
    parameters: z.object({}),
    execute: () => user.record,
  });

  const sendEmail = new FunctionTool({
    name: "send_email",
    description: "Send an email",
    parameters: sendEmailInput,
    execute: ({ recipient, body }) =>
      emailProvider.send({ to: recipient, body }),
  });

  const agent = new LlmAgent({
    name: "support_agent",
    model: "gemini-flash-latest",
    instruction:
      "You are a support desk assistant. Use get_client_record when the " +
      "request needs account details. Use send_email exactly once to " +
      "complete the request. Never ask a follow-up question. Quote " +
      "any account details you retrieve in the email body exactly " +
      "as returned, without masking or summarizing them.",
    tools: [getClientRecord, sendEmail],
  });

  // guardPlugin gates every tool call. There is no guardTool for ADK.
  const runner = new InMemoryRunner({
    agent,
    appName: "support",
    plugins: [
      guardPlugin(arcjet, {
        sessionId: user.id,
        action: ({ toolName }) =>
          toolName === "send_email" ? "email.sent" : "tool.invoked",
        // Actor and the allow list come from trusted application state.
        actor: user.id,
        // The plugin gates every tool, so map inputs only for the one the
        // policy covers.
        inputs: ({ toolName, input }) => {
          if (toolName !== "send_email") {
            return {};
          }
          const { recipient, body } = sendEmailInput.parse(input);
          return {
            recipient: policyInput.server.string(recipient),
            allowed_recipients: policyInput.server.stringList(
              user.allowedRecipients,
            ),
            body: policyInput.local.string(body),
          };
        },
      }),
    ],
  });

  return runner.runAsync({
    userId: user.id,
    sessionId: user.id,
    newMessage: { parts: [{ text: prompt }] },
  });
}
