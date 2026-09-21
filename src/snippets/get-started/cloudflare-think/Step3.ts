import { launchArcjet, detectPromptInjection, policyInput } from "@arcjet/guard";
import {
  cloudflareThinkContext,
  guardHooks,
} from "@arcjet/guard/cloudflare-think/v0";
import { Think } from "@cloudflare/think";
import { tool } from "ai";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

const lookupOrderInput = z.object({ orderId: z.string() });

export async function runAgent(
  user: { id: string; orderIds: string[] },
  userText: string,
) {
  const appContext = { sessionId: user.id };
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(userText)],
    ...cloudflareThinkContext({ context: appContext }),
  });

  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Message blocked");
  }

  // Omit actor or inputs and a remote rule that declares those names
  // never fires.
  const hooks = guardHooks(arcjet, {
    sessionId: user.id,
    action: ({ toolName }) =>
      toolName === "lookup_order" ? "order.looked-up" : "tool.invoked",
    actor: user.id,
    inputs: ({ toolName, input }) => {
      if (toolName !== "lookup_order") {
        return {};
      }
      const { orderId } = lookupOrderInput.parse(input);
      return {
        order_id: policyInput.server.string(orderId),
        owned_orders: policyInput.server.stringList(user.orderIds),
      };
    },
  });

  // `npx wrangler types` generates `Env`. This placeholder lets the
  // file type-check before that file exists.
  interface Env {}

  class OrderAgent extends Think<Env> {
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

  const agent = new OrderAgent();
  return agent.chat(userText);
}
