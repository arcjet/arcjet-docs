import os

from arcjet.guard import DetectPromptInjection, TokenBucket, launch_arcjet_sync
from arcjet.guard.crewai import guard_hooks
from crewai import Agent, Crew, Task
from crewai.tools import tool

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


guard_hooks(
    guard=arcjet,
    tools=["lookup_order"],
    action="order.looked-up",
    rules=lambda ctx: [
        lookup_limit(key=ctx.tool_input["order_id"], requested=5)
    ],
)

agent = Agent(
    role="Order clerk",
    goal="Look up the requested order",
    backstory="You look up orders by ID.",
    tools=[lookup_order],
)
task = Task(
    description="Look up order {order_id}",
    expected_output="The order status",
    agent=agent,
)
crew = Crew(agents=[agent], tasks=[task])


def run_crew(user_text: str, order_id: str) -> str:
    decision = arcjet.guard_sync(
        label="message.received",
        rules=[inbound(user_text)],
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Message blocked")
    result = crew.kickoff(inputs={"order_id": order_id})
    return str(result)
