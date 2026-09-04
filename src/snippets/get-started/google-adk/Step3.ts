import {
  launchArcjet,
  detectPromptInjection,
  tokenBucket,
} from "@arcjet/guard";
import { guardPlugin, googleAdkContext } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});
const inbound = detectPromptInjection();

const lookupOrderInput = z.object({ orderId: z.string() });

const lookupOrder = new FunctionTool({
  name: "lookup_order",
  description: "Look up an order by ID",
  parameters: lookupOrderInput,
  execute: ({ orderId }) => ({ orderId, status: "shipped" }),
});

const agent = new LlmAgent({
  name: "order_agent",
  model: "gemini-flash-latest",
  instruction: "Look up orders with lookup_order.",
  tools: [lookupOrder],
});

export async function runAgent(conversationId: string, userText: string) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...googleAdkContext(appContext),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  const runner = new InMemoryRunner({
    agent,
    appName: "orders",
    plugins: [
      guardPlugin(arcjet, {
        sessionId: conversationId,
        rules: ({ toolName, input }) => {
          if (toolName !== "lookup_order") {
            return [];
          }
          const { orderId } = lookupOrderInput.parse(input);
          return [lookupLimit({ key: orderId, requested: 1 })];
        },
      }),
    ],
  });

  return runner.runAsync({
    userId: conversationId,
    sessionId: conversationId,
    newMessage: { parts: [{ text: userText }] },
  });
}
