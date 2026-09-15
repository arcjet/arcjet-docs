import os

from strands import Agent, tool
from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.strands_agents import guard_hooks, guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


@tool
def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


def run_agent(user_id: str, owned_orders: list[str], user_text: str):
    guarded_lookup = guard_tool(
        guard=arcjet,
        tool=lookup_order,
        # The action selects the policy you published.
        action="order.looked-up",
        # Actor and the order list come from trusted application state.
        actor=user_id,
        # Map only the values the policy needs.
        inputs=lambda arguments: {
            "order_id": server_input.string(arguments["order_id"]),
            "owned_orders": server_input.string_list(owned_orders),
        },
    )

    agent = Agent(
        tools=[guarded_lookup],
        # The hooks gate tools this file did not wrap.
        hooks=[guard_hooks(guard=arcjet, session_id=user_id)],
    )
    return agent(user_text)
