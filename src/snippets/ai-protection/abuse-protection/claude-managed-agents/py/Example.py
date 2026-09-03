import os

from anthropic import Anthropic
from arcjet.guard import (
    DetectPromptInjection,
    TokenBucket,
    launch_arcjet,
)
from arcjet.guard.claude_managed_agents import (
    guard_custom_tool,
    guard_events,
)

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
client = Anthropic()
inbound = DetectPromptInjection()
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


async def lookup_order(arguments: dict) -> dict:
    return {"order_id": arguments["order_id"], "status": "shipped"}


guarded_lookup = guard_custom_tool(
    guard=arcjet,
    tool=lookup_order,
    action="order.looked-up",
    rules=lambda arguments: [
        lookup_limit(key=arguments["order_id"], requested=5)
    ],
)


async def send_turn(session_id: str, user_text: str) -> None:
    # Screen the prompt before you send `user.message`. On `DENY`, don't
    # send the event: the model never sees the prompt.
    await guard_events(
        guard=arcjet,
        session_id=session_id,
        inbound={
            "action": "message.received",
            "rules": lambda arguments: [inbound(arguments["prompt"])],
        },
        prompt=user_text,
    )
    client.beta.sessions.events.send(
        session_id,
        events=[
            {
                "type": "user.message",
                "content": [{"type": "text", "text": user_text}],
            }
        ],
    )
