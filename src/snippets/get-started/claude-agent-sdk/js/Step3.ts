import {
  createSdkMcpServer,
  query,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import { launchArcjet, policyInput } from "@arcjet/guard";
import { guardHooks, guardTool } from "@arcjet/guard/claude-agent-sdk/v0";
import { z } from "zod";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

export async function runAgent(
  user: { id: string; orderIds: string[] },
  sessionId: string,
  userText: string,
) {
  const lookupOrder = guardTool(
    arcjet,
    tool(
      "lookup_order",
      "Look up an order by ID",
      { orderId: z.string() },
      async ({ orderId }) => ({
        content: [{ type: "text", text: `${orderId}: shipped` }],
      }),
    ),
    {
      // The action selects the policy you published.
      action: "order.looked-up",
      // An authored tool's handler has no session id of its own, so pass
      // the one this run uses.
      sessionId,
      // Actor and the order list come from trusted application state.
      actor: user.id,
      // Map only the values the policy needs.
      inputs: ({ orderId }) => ({
        order_id: policyInput.server.string(orderId),
        owned_orders: policyInput.server.stringList(user.orderIds),
      }),
    },
  );

  const server = createSdkMcpServer({
    name: "orders",
    version: "1.0.0",
    tools: [lookupOrder],
  });

  for await (const message of query({
    prompt: userText,
    options: {
      sessionId,
      mcpServers: { orders: server },
      allowedTools: ["mcp__orders__lookup_order"],
      // The hooks gate built-in and MCP tools this file did not wrap.
      hooks: guardHooks(arcjet, { sessionId }),
    },
  })) {
    void message;
  }
}
