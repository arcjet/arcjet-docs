import os

from arcjet.guard import launch_arcjet_sync, server_input
from arcjet.guard.crewai import register_arcjet_hooks
from crewai import Agent, Crew, Task
from crewai.tools import tool

arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])


@tool("lookup_order")
def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


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


def run_crew(user_id: str, owned_orders: list[str], order_id: str) -> str:
    register_arcjet_hooks(
        guard=arcjet,
        tools=["lookup_order"],
        # The action selects the policy you published.
        action="order.looked-up",
        # Actor and the order list come from trusted application state.
        actor=user_id,
        # Map only the values the policy needs.
        inputs=lambda arguments, _ctx: {
            "order_id": server_input.string(arguments["order_id"]),
            "owned_orders": server_input.string_list(owned_orders),
        },
    )
    result = crew.kickoff(inputs={"order_id": order_id})
    return str(result)
