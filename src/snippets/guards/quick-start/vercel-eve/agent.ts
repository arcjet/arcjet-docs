import { launchArcjet, localDetectSensitiveInfo } from "@arcjet/guard";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { guardTool } from "@arcjet/guard/vercel-eve/v0";
import { defineTool } from "eve/tools";
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

export function emailTools(user: {
  record: {
    name: string;
    bankAccount: string;
    routingNumber: string;
  };
}) {
  const getClientRecord = defineTool({
    description: "Get the account details on file for the current customer",
    inputSchema: z.object({}),
    async execute() {
      return user.record;
    },
  });

  // On DENY, Eve projects a throw as a failed action.result. Pass
  // onDeny: "result" so the model can read the denial payload.
  const sendEmail = guardTool(
    arcjet,
    defineTool({
      description: "Send an email",
      inputSchema: z.object({
        recipient: z.string(),
        body: z.string(),
      }),
      async execute({ recipient, body }) {
        return emailProvider.send({ to: recipient, body });
      },
    }),
    {
      action: "email.sent",
      onDeny: "result",
      rules: ({ body }) => [detectPii(body)],
    },
  );

  return { getClientRecord, sendEmail };
}
