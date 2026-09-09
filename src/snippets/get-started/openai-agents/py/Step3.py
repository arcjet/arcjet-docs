import os

from agents import Agent, Runner, function_tool
from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.openai_agents import guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


@function_tool
def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


def build_agent(user_id: str, owned_orders: list[str]) -> Agent:
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
    return Agent(
        name="support-agent",
        instructions="Help the user look up orders.",
        tools=[guarded_lookup],
    )


async def run_agent(user_id: str, owned_orders: list[str], user_text: str):
    agent = build_agent(user_id, owned_orders)
    return await Runner.run(
        agent, user_text, context={"session_id": user_id}
    )
