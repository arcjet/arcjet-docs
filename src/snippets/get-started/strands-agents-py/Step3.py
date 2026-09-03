import os

from strands import Agent, tool
from arcjet.guard import DetectPromptInjection, TokenBucket, launch_arcjet
from arcjet.guard.strands_agents import (
    guard_hooks,
    guard_tool,
    strands_agent_context,
)

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()
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


async def run_agent(conversation_id: str, user_text: str):
    guarded_lookup = guard_tool(
        guard=arcjet,
        tool=lookup_order,
        action="order.looked-up",
        rules=lambda arguments: [
            lookup_limit(key=arguments["order_id"], requested=5)
        ],
    )
    app_context = {"session_id": conversation_id}
    derived = strands_agent_context(app_context)

    decision = await arcjet.guard(
        label="message.received",
        rules=[inbound(user_text)],
        correlation_id=derived.correlation_id,
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Message blocked")

    agent = Agent(
        tools=[guarded_lookup],
        hooks=[
            guard_hooks(guard=arcjet, session_id=conversation_id)
        ],
    )
    return agent(user_text)
