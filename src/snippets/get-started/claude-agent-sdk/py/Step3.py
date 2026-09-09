import os

from claude_agent_sdk import (
    ClaudeAgentOptions,
    create_sdk_mcp_server,
    query,
    tool,
)
from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.claude_agent_sdk import guard_hooks, guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


@tool("lookup_order", "Look up an order by ID", {"order_id": str})
async def lookup_order(args: dict) -> dict:
    return {
        "content": [
            {
                "type": "text",
                "text": f"{args['order_id']}: shipped",
            }
        ]
    }


async def run_agent(
    user_id: str,
    owned_orders: list[str],
    session_id: str,
    user_text: str,
):
    guarded_lookup = guard_tool(
        guard=arcjet,
        tool=lookup_order,
        # The action selects the policy you published.
        action="order.looked-up",
        session_id=session_id,
        # Actor and the order list come from trusted application state.
        actor=user_id,
        # Map only the values the policy needs.
        inputs=lambda arguments: {
            "order_id": server_input.string(arguments["order_id"]),
            "owned_orders": server_input.string_list(owned_orders),
        },
    )
    server = create_sdk_mcp_server(
        name="orders",
        version="1.0.0",
        tools=[guarded_lookup],
    )

    async for message in query(
        prompt=user_text,
        options=ClaudeAgentOptions(
            session_id=session_id,
            mcp_servers={"orders": server},
            allowed_tools=["mcp__orders__lookup_order"],
            # The hooks gate built-in and MCP tools this file did not wrap.
            hooks=guard_hooks(
                guard=arcjet,
                session_id=session_id,
                exclude=[{"server": "orders", "name": "lookup_order"}],
            ),
        ),
    ):
        pass
