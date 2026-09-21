import os

from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.tools import FunctionTool
from google.genai import types
from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.google_adk import google_adk_context, guard_plugin

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


agent = LlmAgent(
    name="order_agent",
    model="gemini-flash-latest",
    instruction="Look up orders with lookup_order.",
    tools=[FunctionTool(lookup_order)],
)


async def run_agent(user: dict, user_text: str):
    conversation_id = user["id"]
    app_context = {"session_id": conversation_id}
    derived = google_adk_context(app_context)

    decision = await arcjet.guard(
        label="message.received",
        correlation_id=derived.correlation_id,
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Message blocked")

    # guard_plugin gates every tool call. Omit actor or inputs and a
    # remote rule that declares those names never fires.
    runner = InMemoryRunner(
        agent=agent,
        app_name="orders",
        plugins=[
            guard_plugin(
                guard=arcjet,
                session_id=conversation_id,
                action=lambda call: (
                    "order.looked-up"
                    if call["tool_name"] == "lookup_order"
                    else "tool.invoked"
                ),
                actor=conversation_id,
                inputs=lambda call: (
                    {
                        "order_id": server_input.string(call["order_id"]),
                        "owned_orders": server_input.string_list(
                            user["order_ids"]
                        ),
                    }
                    if call["tool_name"] == "lookup_order"
                    else {}
                ),
            )
        ],
    )
    return runner.run_async(
        user_id=conversation_id,
        session_id=conversation_id,
        new_message=types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_text)],
        ),
    )
