import os

from anthropic import Anthropic
from arcjet.guard import DetectPromptInjection, TokenBucket, launch_arcjet
from arcjet.guard.claude_managed_agents import (
    guard_custom_tool,
    guard_events,
)

client = Anthropic()
arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


async def lookup_order(arguments: dict) -> dict:
    return {
        "order_id": arguments["order_id"],
        "status": "shipped",
    }


async def run_agent(session_id: str, user_text: str):
    guarded_lookup = guard_custom_tool(
        guard=arcjet,
        tool=lookup_order,
        action="order.looked-up",
        session_id=session_id,
        rules=lambda arguments: [
            lookup_limit(key=arguments["order_id"], requested=5)
        ],
    )
    await guard_events(
        guard=arcjet,
        session_id=session_id,
        inbound={
            "action": "message.received",
            "rules": lambda arguments: [inbound(arguments["prompt"])],
        },
        prompt=user_text,
    )
    with client.beta.sessions.events.stream(session_id) as stream:
        client.beta.sessions.events.send(
            session_id,
            events=[
                {
                    "type": "user.message",
                    "content": [{"type": "text", "text": user_text}],
                }
            ],
        )
        for event in stream:
            if event.type == "agent.custom_tool_use":
                result = await guarded_lookup(event.input)
                client.beta.sessions.events.send(
                    session_id,
                    events=[
                        {
                            "type": "user.custom_tool_result",
                            "custom_tool_use_id": event.id,
                            "content": [
                                {
                                    "type": "text",
                                    "text": str(result),
                                }
                            ],
                        }
                    ],
                )
