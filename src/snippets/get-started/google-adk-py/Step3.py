import os

from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.tools import FunctionTool
from google.genai import types
from arcjet.guard import DetectPromptInjection, TokenBucket, launch_arcjet
from arcjet.guard.google_adk import google_adk_context, guard_plugin

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()
lookup_limit = TokenBucket(
    refill_rate=5,
    interval_seconds=10,
    max_tokens=10,
    bucket="lookups",
)


def lookup_order(order_id: str) -> dict:
    """Look up an order by ID."""
    return {"order_id": order_id, "status": "shipped"}


agent = LlmAgent(
    name="order_agent",
    model="gemini-flash-latest",
    instruction="Look up orders with lookup_order.",
    tools=[FunctionTool(lookup_order)],
)


async def run_agent(conversation_id: str, user_text: str):
    app_context = {"session_id": conversation_id}
    derived = google_adk_context(app_context)

    decision = await arcjet.guard(
        label="message.received",
        rules=[inbound(user_text)],
        correlation_id=derived.correlation_id,
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Message blocked")

    runner = InMemoryRunner(
        agent=agent,
        app_name="orders",
        plugins=[
            guard_plugin(
                guard=arcjet,
                session_id=conversation_id,
                rules=lambda call: (
                    [lookup_limit(key=call["input"]["order_id"], requested=1)]
                    if call["tool_name"] == "lookup_order"
                    else []
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
