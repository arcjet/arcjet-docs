import os

from anthropic import AsyncAnthropic
from arcjet.guard import (
    ArcjetDeniedError,
    DetectPromptInjection,
    TokenBucket,
    launch_arcjet,
)
from arcjet.guard.claude_managed_agents import (
    guard_custom_tool,
    guard_events,
)

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])

# guard_events runs an inbound check before each user.message reaches the
# session, so use the async client: the sync one can't be awaited here.
client = AsyncAnthropic()
inbound = DetectPromptInjection()
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


async def lookup_order(event) -> dict:
    return {"order_id": event.input["order_id"], "status": "shipped"}


# Pass run= for the hosted path. Call the result with the
# agent.custom_tool_use event, the send callable, and the Anthropic session
# id, so a denial can be posted as the tool result.
guarded_lookup = guard_custom_tool(
    guard=arcjet,
    run=lookup_order,
    action="order.looked-up",
    rules=lambda arguments: [
        lookup_limit(key=arguments["order_id"], requested=5)
    ],
)

# guard_events wraps send. On DENY it raises and never calls the real send,
# so the model never sees the prompt.
send = guard_events(
    guard=arcjet,
    send=client.beta.sessions.events.send,
    action="message.received",
    rules=lambda arguments: [inbound(arguments["prompt"])],
)


async def send_turn(session_id: str, user_text: str) -> bool:
    try:
        await send(
            session_id,
            events=[
                {
                    "type": "user.message",
                    "content": [{"type": "text", "text": user_text}],
                }
            ],
        )
    except ArcjetDeniedError:
        return False
    return True
