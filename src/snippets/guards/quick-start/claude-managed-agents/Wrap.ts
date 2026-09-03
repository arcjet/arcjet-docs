import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import {
  guardCustomTool,
  guardEvents,
} from "@arcjet/guard/claude-managed-agents/v0";

// Create one Arcjet client and reuse it across agent runs. Rampart
// detects bank account and routing numbers locally.
const arcjet = launchArcjet({
  key: process.env.ARCJET_KEY!,
  sensitiveInfoBackend: rampart(),
});
const detectPii = localDetectSensitiveInfo({
  deny: ["BANK_ACCOUNT", "ROUTING_NUMBER"],
});
const client = new Anthropic();

// Placeholder for your mail transport.
const emailProvider = {
  send: async (_: { to: string; body: string }) => ({ ok: true }),
};

export function emailTools(user: {
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
}) {
  const getClientRecord = async () => user.record;

  // This adapter submits action and rules. The recipient
  // allow list is not enforced in this sample.
  const sendEmail = guardCustomTool(
    arcjet,
    async ({ recipient, body }: { recipient: string; body: string }) => {
      await emailProvider.send({ to: recipient, body });
      return { status: "sent" };
    },
    {
      action: "email.sent",
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
  const { getClientRecord, sendEmail } = emailTools(user);
  const tools = {
    get_client_record: getClientRecord,
    send_email: sendEmail,
  };

  await guardEvents(arcjet, { sessionId, prompt });

  const stream = await client.beta.sessions.events.stream(sessionId);
  await client.beta.sessions.events.send(sessionId, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: prompt }],
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "agent.custom_tool_use") {
      const toolName = event.name as keyof typeof tools;
      const result = await tools[toolName](event.input);
      await client.beta.sessions.events.send(sessionId, {
        events: [
          {
            type: "user.custom_tool_result",
            custom_tool_use_id: event.id,
            content: [{ type: "text", text: JSON.stringify(result) }],
          },
        ],
      });
    }
    if (event.type === "session.status_idle") {
      return "Agent run completed.";
    }
  }
}
