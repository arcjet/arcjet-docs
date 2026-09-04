import os

from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet_sync
from arcjet.guard.crewai import free_text_arguments, register_arcjet_hooks
from crewai.tools import tool

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
detect_pii = LocalDetectSensitiveInfo(
    deny=["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
)


@tool("save_note")
def save_note(order_id: str, note: str) -> dict:
    """Save a free-text note on an order."""
    return {"order_id": order_id, "note": note}


# `free_text_arguments` strips opaque IDs such as `order_id`, so only the
# free-text note reaches the detector.
handle = register_arcjet_hooks(
    guard=arcjet,
    tools=["save_note"],
    action="note.saved",
    rules=lambda arguments, _ctx: [
        detect_pii(free_text_arguments(arguments)["note"])
    ],
)
