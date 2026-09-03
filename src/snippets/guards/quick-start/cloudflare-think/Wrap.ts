import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardHooks } from "@arcjet/guard/cloudflare-think/v0";
import { Think } from "@cloudflare/think";
import { tool } from "ai";
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

// Placeholder for your mail transport.
const emailProvider = {
  send: async (_: { to: string; body: string }) => ({ ok: true }),
};

let currentUser: {
  id: string;
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
};

const hooks = guardHooks(arcjet, {
  // This adapter submits action and rules. It doesn't accept
  // inputs. There is no guardTool.
  action: ({ toolName }) =>
    toolName === "send_email" ? "email.sent" : "tool.invoked",
  rules: ({ toolName, input }) => {
    if (toolName !== "send_email") {
      return [];
    }
    const { body } = sendEmailInput.parse(input);
    return [detectPii(body)];
  },
});

export class SupportAgent extends Think<Env> {
  getModel() {
    return "@cf/moonshotai/kimi-k2.7-code";
  }

  getSystemPrompt() {
    return "Use get_client_record when the user asks for account details. Use send_email exactly once to complete the request.";
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
