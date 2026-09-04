import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";
import { chat, toolDefinition } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { z } from "zod";

// Placeholder for your mail transport.
const emailProvider = {
  send: async (_: { to: string; body: string }) => ({ ok: true }),
};

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

const sendEmailInput = z.object({
  recipient: z.string(),
  body: z.string(),
});

// Without a role the model asks a clarifying question, or masks the
// account numbers itself, instead of calling send_email with them. Either
// way the guard never gets a decision to make. The last two sentences make
// the sample deterministic; a real prompt can't be relied on for that,
// which is the reason to guard the tool.
const SYSTEM_PROMPT =
  "You are a support desk assistant. Use get_client_record when the " +
  "request needs account details. Use send_email exactly once to " +
  "complete the request. Never ask a follow-up question. Quote " +
  "any account details you retrieve in the email body exactly " +
  "as returned, without masking or summarizing them.";

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
    description: "Get the account details on file for the current customer",
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
    system: SYSTEM_PROMPT,
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
