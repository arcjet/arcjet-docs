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


async def lookup_order(arguments: dict) -> dict:
    return {"order_id": arguments["order_id"], "status": "shipped"}


guarded_lookup = guard_custom_tool(
    guard=arcjet,
    tool=lookup_order,
    action="order.looked-up",
    # Deduct 50 tokens from the bucket. The value for `requested` must be a
    # positive integer.
    rules=lambda arguments: [
        lookup_limit(key=arguments["order_id"], requested=50)
    ],
)
