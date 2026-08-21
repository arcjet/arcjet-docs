import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import {
  guardTool,
  guardMiddleware,
  genkitContext,
} from "@arcjet/guard/genkit/v1";
import { genkit, z } from "genkit";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const ai = genkit({
  // Configure your model plugin.
});

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});
const inbound = detectPromptInjection();

export const lookupOrder = guardTool(
  arcjet,
  ai.defineTool(
    {
      name: "lookup_order",
      description: "Look up an order by ID",
      inputSchema: z.object({ orderId: z.string() }),
    },
    async ({ orderId }) => ({ orderId, status: "shipped" }),
  ),
  {
    action: "order.looked-up",
    rules: (input) => [lookupLimit({ key: input.orderId, requested: 5 })],
  },
);

export async function runAgent(conversationId: string, userText: string) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...genkitContext({ context: appContext }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  return ai.generate({
    prompt: userText,
    tools: [lookupOrder],
    use: [guardMiddleware(arcjet, { sessionId: conversationId })],
    context: appContext,
  });
}
