import os

from strands import tool
from arcjet.guard import TokenBucket, launch_arcjet
from arcjet.guard.strands_agents import guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


@tool
def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


guarded_lookup = guard_tool(
    guard=arcjet,
    tool=lookup_order,
    action="order.looked-up",
    rules=lambda arguments: [
        lookup_limit(key=arguments["order_id"], requested=5)
    ],
)
