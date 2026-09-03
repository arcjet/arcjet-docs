import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";
import { FunctionTool, InMemoryRunner, LlmAgent } from "@google/adk";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

const lookupOrderInput = z.object({ orderId: z.string() });

const lookupOrder = new FunctionTool({
  name: "lookup_order",
  description: "Look up an order by ID",
  parameters: lookupOrderInput,
  execute: ({ orderId }) => ({ orderId, status: "shipped" }),
});

const agent = new LlmAgent({
  name: "support_agent",
  model: "gemini-flash-latest",
  instruction: "Help the user look up orders.",
  tools: [lookupOrder],
});

// There is no `guardTool`. Policy sits on `beforeToolCallback`, so put
// Arcjet first in the plugin list.
export const runner = new InMemoryRunner({
  agent,
  appName: "support",
  plugins: [
    guardPlugin(arcjet, {
      action: "order.looked-up",
      rules: ({ toolName, input }) => {
        if (toolName !== "lookup_order") {
          return [];
        }
        const { orderId } = lookupOrderInput.parse(input);
        return [lookupLimit({ key: orderId, requested: 5 })];
      },
    }),
  ],
});
