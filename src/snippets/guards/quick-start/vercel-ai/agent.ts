import { launchArcjet, policyInput } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import {
  aiToolsContext,
  createAgentContext,
  guardTool,
} from "@arcjet/guard/vercel-ai/v7";
import { generateText, stepCountIs, tool } from "ai";
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
  // This read-only tool gives the model the current customer's
  // account data.
  const getClientRecord = tool({
    description: "Get the account details on file for the current customer",
    inputSchema: z.object({}),
    execute: () => user.record,
  });

  // guardTool checks policy before the email provider can run.
  const sendEmail = guardTool(
    arcjet,
    tool({
      description: "Send an email",
      inputSchema: z.object({
        recipient: z.string().email(),
        body: z.string(),
      }),
      execute: ({ recipient, body }) =>
        emailProvider.send({ to: recipient, body }),
    }),
    {
      // The action selects the remote policy configured in step 1.
      action: "email.sent",
      // Actor and the allow list come from trusted application
      // state.
      actor: user.id,
      // Map only the values the remote policy needs.
      inputs: ({ recipient, body }) => ({
        recipient: policyInput.server.string(recipient),
        allowed_recipients: policyInput.server.stringList(
          user.allowedRecipients,
        ),
        body: policyInput.local.string(body),
      }),
    },
  );

  const tools = { getClientRecord, sendEmail };
  const context = createAgentContext();

  // The model can call either tool, but sendEmail always passes
  // through Arcjet.
  return generateText({
    model: "openai/gpt-4o-mini",
    system:
      "You are a support desk assistant. Use getClientRecord when the " +
      "request needs account details. Use sendEmail exactly once to " +
      "complete the request. Never ask a follow-up question. Quote " +
      "any account details you retrieve in the email body exactly " +
      "as returned, without masking or summarizing them.",
    prompt,
    tools,
    toolsContext: aiToolsContext(context, tools),
    stopWhen: stepCountIs(3),
  });
}
