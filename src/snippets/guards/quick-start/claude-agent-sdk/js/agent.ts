import {
  createSdkMcpServer,
  query,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardHooks, guardTool } from "@arcjet/guard/claude-agent-sdk/v0";
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

export function emailTools(
  user: {
    record: {
      name: string;
      bankAccount: string;
      routingNumber: string;
    };
  },
  sessionId: string,
) {
  const getClientRecord = tool(
    "get_client_record",
    "Get the account details on file for the current customer",
    {},
    async () => ({
      content: [{ type: "text", text: JSON.stringify(user.record) }],
    }),
  );

  const sendEmail = guardTool(
    arcjet,
    tool(
      "send_email",
      "Send an email",
      {
        recipient: z.string(),
        body: z.string(),
      },
      async ({ recipient, body }) => {
        await emailProvider.send({ to: recipient, body });
        return {
          content: [{ type: "text", text: "sent" }],
        };
      },
    ),
    {
      action: "email.sent",
      // The detectPii rule blocks the send. An authored tool's handler has
      // no session id of its own, so pass the one this run uses.
      sessionId,
      rules: ({ body }) => [detectPii(body)],
    },
  );

  return { getClientRecord, sendEmail };
}

export async function runEmailAgent(
  user: {
    record: {
      name: string;
      bankAccount: string;
      routingNumber: string;
    };
  },
  sessionId: string,
  prompt: string,
) {
  const { getClientRecord, sendEmail } = emailTools(user, sessionId);
  const server = createSdkMcpServer({
    name: "email",
    version: "1.0.0",
    tools: [getClientRecord, sendEmail],
  });

  for await (const message of query({
    prompt,
    options: {
      sessionId,
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: { email: server },
      allowedTools: ["mcp__email__get_client_record", "mcp__email__send_email"],
      // Isolate the sample. settingSources drops CLAUDE.md and the settings
      // of the machine running this; strictMcpConfig drops its MCP servers
      // too. Without the second one the session can offer the model another
      // way to send mail, straight past the tool you guarded.
      settingSources: [],
      strictMcpConfig: true,
      hooks: guardHooks(arcjet, {
        sessionId,
        // send_email is already wrapped with guardTool. Without this it
        // would be guarded twice for one invocation.
        exclude: [{ server: "email", name: "send_email" }],
      }),
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      return message.result;
    }
  }
}
