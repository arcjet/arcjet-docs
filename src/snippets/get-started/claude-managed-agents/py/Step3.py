import json
import os

from anthropic import AsyncAnthropic
from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.claude_managed_agents import guard_custom_tool

client = AsyncAnthropic()
arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


async def lookup_order(event) -> dict:
    return {
        "order_id": event.input["order_id"],
        "status": "shipped",
    }


# session_id is the Anthropic session id from sessions.create.
# conversation_id is your own id, which is what Arcjet correlates on.
async def run_agent(
    user_id: str,
    owned_orders: list[str],
    session_id: str,
    conversation_id: str,
    user_text: str,
):
    # Pass run= for the hosted path. On DENY the handler sends the denial
    # as the tool result and lookup_order never runs.
    guarded_lookup = guard_custom_tool(
        guard=arcjet,
        run=lookup_order,
        # The action selects the policy you published.
        action="order.looked-up",
        session_id=conversation_id,
        # Actor and the order list come from trusted application state.
        actor=user_id,
        # Map only the values the policy needs.
        inputs=lambda arguments: {
            "order_id": server_input.string(arguments["order_id"]),
            "owned_orders": server_input.string_list(owned_orders),
        },
    )

    stream = await client.beta.sessions.events.stream(session_id)
    await client.beta.sessions.events.send(
        session_id,
        events=[
            {
                "type": "user.message",
                "content": [{"type": "text", "text": user_text}],
            }
        ],
    )

    async for event in stream:
        # This agent has one tool. Once you add a second, dispatch on
        # event.name and return an error for names you do not recognize, so
        # an unexpected name cannot reach a tool that was not meant for it.
        if event.type == "agent.custom_tool_use":
            result = await guarded_lookup(
                event,
                send=client.beta.sessions.events.send,
                session_id=session_id,
            )
            # The wrapper already sent the denial and returned None.
            if result is None:
                continue
            await client.beta.sessions.events.send(
                session_id,
                events=[
                    {
                        "type": "user.custom_tool_result",
                        "custom_tool_use_id": event.id,
                        "content": [
                            {"type": "text", "text": json.dumps(result)}
                        ],
                    }
                ],
            )
