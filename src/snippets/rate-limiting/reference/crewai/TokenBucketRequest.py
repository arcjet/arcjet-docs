import os

from arcjet.guard import TokenBucket, launch_arcjet_sync
from arcjet.guard.crewai import register_arcjet_hooks

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)

handle = register_arcjet_hooks(
    guard=arcjet,
    tools=["lookup_order"],
    action="order.looked-up",
    # Deduct 50 tokens from the bucket. The value for `requested` must be a
    # positive integer.
    rules=lambda arguments, _ctx: [
        lookup_limit(key=arguments["order_id"], requested=50)
    ],
)
