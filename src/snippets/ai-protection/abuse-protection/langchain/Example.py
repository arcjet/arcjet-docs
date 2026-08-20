import os

from arcjet.guard import DetectPromptInjection, TokenBucket, launch_arcjet
from arcjet.guard.langchain import ArcjetMiddleware, ToolPolicy
from langchain.agents import create_agent
from langchain_core.tools import tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


@tool
async def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


agent = create_agent(
    model="openai:gpt-4o-mini",
    tools=[lookup_order],
    middleware=[
        ArcjetMiddleware(
            guard=arcjet,
            policies={
                "lookup_order": ToolPolicy(
                    action="order.looked-up",
                    rules=[lookup_limit(key="user123", requested=5)],
                )
            },
            tools=[lookup_order],
        )
    ],
)


async def run_agent(user_id: str, prompt: str):
    decision = await arcjet.guard(
        label="message.received",
        actor=user_id,
        rules=[inbound(prompt)],
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Message blocked")

    return await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config={"configurable": {"thread_id": user_id}},
    )
