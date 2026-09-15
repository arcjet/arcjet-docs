import { launchArcjet, policyInput } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardHooks, guardTool } from "@arcjet/guard/strands-agents/v1";
import { Agent, tool } from "@strands-agents/sdk";
import { z } from "zod";

// Placeholder for your mail transport.
const emailProvider = {
  send: async (_: { to: string; body: string }) => ({ ok: true }),
};

// Create one Arcjet client and reuse it across agent runs. Rampart
// evaluates the policy's LOCAL inputs on this machine, so the email body
// never leaves your application.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend: rampart(),
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
  const getClientRecord = tool({
    name: "get_client_record",
    description: "Get the account details on file for the current customer",
    inputSchema: z.object({}),
    callback: () => user.record,
  });

  const sendEmail = guardTool(
    arcjet,
    tool({
      name: "send_email",
      description: "Send an email",
      inputSchema: z.object({
        recipient: z.string(),
        body: z.string(),
      }),
      callback: ({ recipient, body }) =>
        emailProvider.send({ to: recipient, body }),
    }),
    {
      action: "email.sent",
      // Actor and the allow list come from trusted application state.
      actor: user.id,
      // Map only the values the remote policy needs.
      inputs: (input: { recipient: string; body: string }) => ({
        recipient: policyInput.server.string(input.recipient),
        allowed_recipients: policyInput.server.stringList(
          user.allowedRecipients,
        ),
        body: policyInput.local.string(input.body),
      }),
    },
  );

  const agent = new Agent({
    systemPrompt: SYSTEM_PROMPT,
    tools: [getClientRecord, sendEmail],
    plugins: [guardHooks(arcjet, { sessionId: user.id })],
  });

  return agent.invoke(prompt, {
    invocationState: { sessionId: user.id },
  });
}
