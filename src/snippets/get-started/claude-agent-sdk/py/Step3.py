import os

from claude_agent_sdk import (
    ClaudeAgentOptions,
    create_sdk_mcp_server,
    query,
    tool,
)
from arcjet.guard import DetectPromptInjection, TokenBucket, launch_arcjet
from arcjet.guard.claude_agent_sdk import guard_hooks, guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


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


async def run_agent(session_id: str, user_text: str):
    guarded_lookup = guard_tool(
        guard=arcjet,
        tool=lookup_order,
        action="order.looked-up",
        session_id=session_id,
        rules=lambda arguments: [
            lookup_limit(key=arguments["order_id"], requested=5)
        ],
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
            hooks=guard_hooks(
                guard=arcjet,
                session_id=session_id,
                exclude=[{"server": "orders", "name": "lookup_order"}],
                inbound={
                    "action": "message.received",
                    "rules": lambda arguments: [
                        inbound(arguments["prompt"])
                    ],
                },
            ),
        ),
    ):
        pass
