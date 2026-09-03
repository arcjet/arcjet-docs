import { launchArcjet, detectPromptInjection, tokenBucket } from "@arcjet/guard";
import {
  cloudflareThinkContext,
  guardHooks,
} from "@arcjet/guard/cloudflare-think/v0";
import { Think } from "@cloudflare/think";
import { tool } from "ai";
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

const hooks = guardHooks(arcjet, {
  rules: ({ toolName, input }) => {
    if (toolName !== "lookup_order") {
      return [];
    }
    const { orderId } = lookupOrderInput.parse(input);
    return [lookupLimit({ key: orderId, requested: 1 })];
  },
});

export class OrderAgent extends Think<Env> {
  getModel() {
    return "@cf/moonshotai/kimi-k2.7-code";
  }

  getSystemPrompt() {
    return "Look up orders with lookup_order.";
  }

  getTools() {
    return {
      lookup_order: tool({
        description: "Look up an order by ID",
        inputSchema: lookupOrderInput,
        execute: ({ orderId }) => ({ orderId, status: "shipped" }),
      }),
    };
  }

  beforeToolCall = hooks.beforeToolCall;
}

export async function runAgent(
  conversationId: string,
  userText: string,
) {
  const appContext = { sessionId: conversationId };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...cloudflareThinkContext(appContext),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  const agent = new OrderAgent();
  return agent.chat(userText);
}
