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

type SupportUser = {
  id: string;
  allowedRecipients: string[];
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
};

// `npx wrangler types` generates `Env`. This placeholder lets the
// file type-check before that file exists.
interface Env {}

// Hooks close over the user for this call. Don't keep that user in
// module scope. Every request in one Workers isolate shares it.
// Omit actor or inputs and a remote rule that declares those names
// never fires. There is no guardTool.
function supportHooks(user: SupportUser) {
  return guardHooks(arcjet, {
    action: ({ toolName }) =>
      toolName === "send_email" ? "email.sent" : "tool.invoked",
    actor: user.id,
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
  });
}

export class SupportAgent extends Think<Env> {
  beforeToolCall: ReturnType<typeof supportHooks>["beforeToolCall"];

  constructor(private readonly user: SupportUser) {
    super();
    this.beforeToolCall = supportHooks(user).beforeToolCall;
  }

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
    const user = this.user;
    return {
      get_client_record: tool({
        description:
          "Get the account details on file for the current customer",
        inputSchema: z.object({}),
        execute: () => user.record,
      }),
      send_email: tool({
        description: "Send an email",
        inputSchema: sendEmailInput,
        execute: ({ recipient, body }) =>
          emailProvider.send({ to: recipient, body }),
      }),
    };
  }
}

export async function runEmailAgent(user: SupportUser, prompt: string) {
  const agent = new SupportAgent(user);
  return agent.chat(prompt);
}
