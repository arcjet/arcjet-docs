import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardMiddleware, guardTool } from "@arcjet/guard/langchain/v1";
import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
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
  const getClientRecord = tool(async () => user.record, {
    name: "get_client_record",
    description: "Get the account details on file for the current customer",
    schema: z.object({}),
  });

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

  const agent = createAgent({
    model: "openai:gpt-4o-mini",
    systemPrompt: SYSTEM_PROMPT,
    tools: [getClientRecord, sendEmail],
    middleware: [guardMiddleware(arcjet, { sessionId: user.id })],
  });

  return agent.invoke(
    { messages: [{ role: "user", content: prompt }] },
    { configurable: { thread_id: user.id } },
  );
}
