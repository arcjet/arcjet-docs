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

# `register_arcjet_hooks` defaults to `on_guard_error="deny"`. On a denial or
# when Guard cannot be evaluated, `PRE_TOOL_CALL` raises
# `HookAborted(reason=..., source="arcjet")` so the tool does not run.
handle = register_arcjet_hooks(
    guard=arcjet,
    tools=["lookup_order"],
    action="order.looked-up",
    on_guard_error="deny",
    rules=[lookup_limit(key="user123", requested=5)],
)
