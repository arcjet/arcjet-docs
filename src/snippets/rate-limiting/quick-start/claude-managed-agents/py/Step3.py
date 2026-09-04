import os

from arcjet.guard import TokenBucket, launch_arcjet
from arcjet.guard.claude_managed_agents import guard_custom_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


async def lookup_order(event) -> dict:
    return {"order_id": event.input["order_id"], "status": "shipped"}


# Pass run= for the hosted path. Call the result with the
# agent.custom_tool_use event, the send callable, and the Anthropic
# session id, so a denial can be posted as the tool result.
guarded_lookup = guard_custom_tool(
    guard=arcjet,
    run=lookup_order,
    action="order.looked-up",
    rules=lambda arguments: [
        lookup_limit(key=arguments["order_id"], requested=5)
    ],
)
