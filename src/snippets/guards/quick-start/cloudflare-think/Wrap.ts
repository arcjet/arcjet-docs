import { launchArcjet, policyInput } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardHooks } from "@arcjet/guard/cloudflare-think/v0";
import { Think } from "@cloudflare/think";
import { tool } from "ai";
import { z } from "zod";

// Create one Arcjet client and reuse it across agent runs. Rampart
// evaluates the policy's LOCAL inputs on this machine, so the email
// body never leaves your application.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend: rampart(),
});

const sendEmailInput = z.object({
  recipient: z.string(),
  body: z.string(),
});

// Placeholder for your mail transport.
const emailProvider = {
  send: async (_: { to: string; body: string }) => ({ ok: true }),
};

let currentUser: {
  id: string;
  allowedRecipients: string[];
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
};

// Omit actor or inputs and a remote rule that declares those names
// never fires. There is no guardTool.
const hooks = guardHooks(arcjet, {
  action: ({ toolName }) =>
    toolName === "send_email" ? "email.sent" : "tool.invoked",
  actor: () => currentUser.id,
  inputs: ({ toolName, input }) => {
    if (toolName !== "send_email") {
      return {};
    }
    const { recipient, body } = sendEmailInput.parse(input);
    return {
      recipient: policyInput.server.string(recipient),
      allowed_recipients: policyInput.server.stringList(
        currentUser.allowedRecipients,
      ),
      body: policyInput.local.string(body),
    };
  },
});

export class SupportAgent extends Think<Env> {
  getModel() {
    return "@cf/moonshotai/kimi-k2.7-code";
  }

  getSystemPrompt() {
    return (
      "You are a support desk assistant. Use get_client_record when " +
      "the request needs account details. Use send_email exactly once " +
      "to complete the request. Never ask a follow-up question. Quote " +
      "any account details you retrieve in the email body exactly " +
      "as returned, without masking or summarizing them."
    );
  }

  getTools() {
    return {
      get_client_record: tool({
        description:
          "Get the account details on file for the current customer",
        inputSchema: z.object({}),
        execute: () => currentUser.record,
      }),
      send_email: tool({
        description: "Send an email",
        inputSchema: sendEmailInput,
        execute: ({ recipient, body }) =>
          emailProvider.send({ to: recipient, body }),
      }),
    };
  }

  beforeToolCall = hooks.beforeToolCall;
}

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
  const agent = new SupportAgent();
  return agent.chat(prompt);
}
