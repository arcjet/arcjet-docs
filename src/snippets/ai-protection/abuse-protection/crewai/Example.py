import os

from arcjet.guard import (
    DetectPromptInjection,
    TokenBucket,
    launch_arcjet_sync,
)
from arcjet.guard.crewai import register_arcjet_hooks
from crewai.tools import tool

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


@tool("lookup_order")
def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


# register_arcjet_hooks gates every named tool on PRE_TOOL_CALL.
handle = register_arcjet_hooks(
    guard=arcjet,
    tools=["lookup_order"],
    action="order.looked-up",
    rules=lambda arguments, _ctx: [
        lookup_limit(key=arguments["order_id"], requested=5)
    ],
)


def run_crew(crew, user_text: str) -> str:
    # There is no inbound hook, so screen user text before kickoff.
    decision = arcjet.guard_sync(
        label="message.received",
        rules=[inbound(user_text)],
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Message blocked")

    return str(crew.kickoff(inputs={"request": user_text}))
