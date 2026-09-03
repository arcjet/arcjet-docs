import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import {
  FunctionTool,
  InMemoryRunner,
  LlmAgent,
  createUserContent,
} from "@google/adk";
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

const getClientRecord = new FunctionTool({
  name: "get_client_record",
  description:
    "Get the account details on file for the current customer",
  parameters: z.object({}),
  execute: () => currentUser.record,
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
    "Use get_client_record when the user asks for account details. Use send_email exactly once to complete the request.",
  tools: [getClientRecord, sendEmail],
});

let currentUser: {
  id: string;
  allowedRecipients: string[];
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
};

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
  currentUser = user;

  // This adapter accepts action and rules. It doesn't accept
  // inputs. There is no guardTool.
  const runner = new InMemoryRunner({
    agent,
    appName: "support",
    plugins: [
      guardPlugin(arcjet, {
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

  return runner.runAsync({
    userId: user.id,
    sessionId: user.id,
    newMessage: createUserContent(prompt),
  });
}
