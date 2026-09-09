import os

from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.langchain import ArcjetMiddleware, ToolPolicy
from langchain.agents import create_agent
from langchain_core.tools import tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


@tool
async def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


def build_agent(user_id: str, owned_orders: list[str]):
    return create_agent(
        model="openai:gpt-4o-mini",
        tools=[lookup_order],
        middleware=[
            ArcjetMiddleware(
                guard=arcjet,
                policies={
                    "lookup_order": ToolPolicy(
                        # The action selects the policy you published.
                        action="order.looked-up",
                        # Actor and the order list come from trusted
                        # application state.
                        actor=user_id,
                        # Map only the values the policy needs.
                        inputs=lambda arguments: {
                            "order_id": server_input.string(
                                arguments["order_id"]
                            ),
                            "owned_orders": server_input.string_list(
                                owned_orders
                            ),
                        },
                    )
                },
                tools=[lookup_order],
            )
        ],
    )


async def run_agent(user_id: str, owned_orders: list[str], prompt: str):
    agent = build_agent(user_id, owned_orders)
    return await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config={"configurable": {"thread_id": user_id}},
    )
