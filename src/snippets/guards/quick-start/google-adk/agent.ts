import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
import { z } from "zod";

// Rampart detects bank account and routing numbers on this machine. The
// rule needs its own reference to it, so share one instance: entity types
// outside the default set throw unless the rule has a backend.
const sensitiveInfoBackend = rampart();

// Create one Arcjet client and reuse it across agent runs.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend,
});
const detectPii = localDetectSensitiveInfo({
  deny: ["BANK_ACCOUNT", "ROUTING_NUMBER"],
  backend: sensitiveInfoBackend,
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
    newMessage: { parts: [{ text: prompt }] },
  });
}
