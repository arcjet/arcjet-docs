import os

from strands import tool
from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.strands_agents import guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
detect_pii = LocalDetectSensitiveInfo(
    deny=["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
)


@tool
def save_note(order_id: str, note: str) -> dict:
    """Save a free-text note on an order."""
    return {"order_id": order_id, "note": note}


guarded_save_note = guard_tool(
    guard=arcjet,
    tool=save_note,
    action="note.saved",
    rules=lambda arguments: [detect_pii(arguments["note"])],
)
