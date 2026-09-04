import Anthropic from "@anthropic-ai/sdk";
import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import {
  claudeManagedAgentsContext,
  guardCustomTool,
  guardEvents,
} from "@arcjet/guard/claude-managed-agents/v0";

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
const client = new Anthropic();

export async function runEmailAgent(
  user: {
    conversationId: string;
    record: {
      name: string;
      bankAccount: string;
      routingNumber: string;
    };
  },
  sessionId: string,
  prompt: string,
) {
  // Correlation is your own conversation id, never the Anthropic
  // session id.
  const context = claudeManagedAgentsContext({
    correlationId: user.conversationId,
  });

  const stream = await client.beta.sessions.events.stream(sessionId);

  // Every tool result goes back on the same event, so build it in one place.
  const sendToolResult = (
    customToolUseId: string,
    output: unknown,
    isError = false,
  ) =>
    client.beta.sessions.events.send(sessionId, {
      events: [
        {
          type: "user.custom_tool_result",
          custom_tool_use_id: customToolUseId,
          content: [{ type: "text", text: JSON.stringify(output) }],
          is_error: isError,
        },
      ],
    });

  // Anthropic runs the tool loop, so there is no PreToolUse hook. This
  // screens the prompt and sends it only if the guard allows.
  const inbound = await guardEvents(
    arcjet,
    {
      events: [
        { type: "user.message", content: [{ type: "text", text: prompt }] },
      ],
      inbound: { action: "message.received" },
      context,
    },
    (body) => client.beta.sessions.events.send(sessionId, body),
  );
  if (!inbound.allowed) {
    return inbound.message;
  }

  for await (const event of stream) {
    if (event.type === "agent.custom_tool_use") {
      // Dispatch on the tool name and treat anything else as an error. A
      // fallback here would hand an unknown name to whichever tool the
      // branch happens to end on, so name every tool you accept.
      if (event.name === "get_client_record") {
        await sendToolResult(event.id, user.record);
      } else if (event.name === "send_email") {
        // On deny, guardCustomTool sends the error result itself and
        // emailProvider is never called.
        const gated = await guardCustomTool(
          arcjet,
          {
            event,
            execute: async (input) =>
              emailProvider.send({
                to: String(input.recipient),
                body: String(input.body),
              }),
            send: (result) =>
              client.beta.sessions.events.send(sessionId, { events: [result] }),
          },
          {
            action: "email.sent",
            rules: (input) => [detectPii(String(input.body))],
            context,
          },
        );

        if (gated.allowed) {
          await sendToolResult(event.id, gated.output);
        }
      } else {
        await sendToolResult(event.id, `Unknown tool: ${event.name}`, true);
      }
    }

    if (event.type === "session.status_idle") {
      return "Agent run completed.";
    }
  }
}
