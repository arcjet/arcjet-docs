import os

from arcjet.guard import TokenBucket, launch_arcjet
from arcjet.guard.langchain import guard_tool
from langchain_core.tools import tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


@tool
async def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


lookup_order = guard_tool(
    guard=arcjet,
    tool=lookup_order,
    action="order.looked-up",
    rules=[lookup_limit(key="user123", requested=5)],
)
