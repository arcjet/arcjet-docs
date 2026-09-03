import os

from arcjet.guard import TokenBucket, launch_arcjet
from arcjet.guard.strands_agents import guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)

# `guard_tool` and `guard_hooks` default to `on_guard_error="deny"`. The tool
# does not run if Guard cannot be evaluated. Set `"allow"` only when
# executing without a complete security decision is acceptable.
guarded_lookup = guard_tool(
    guard=arcjet,
    tool=lookup_order,
    action="order.looked-up",
    on_guard_error="deny",
    rules=[lookup_limit(key="user123", requested=5)],
)
