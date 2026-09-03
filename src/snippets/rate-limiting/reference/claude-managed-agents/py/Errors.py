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

# `guard_custom_tool` and `guard_events` default to
# `on_guard_error="deny"`. The custom-tool handler does not run if Guard
# cannot be evaluated. Return the denial as `user.custom_tool_result` with
# `is_error` set. Don't raise.
guarded_lookup = guard_custom_tool(
    guard=arcjet,
    tool=lookup_order,
    action="order.looked-up",
    on_guard_error="deny",
    rules=[lookup_limit(key="user123", requested=5)],
)
