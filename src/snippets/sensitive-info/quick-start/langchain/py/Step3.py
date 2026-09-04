import os

from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from langchain_core.tools import tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
detect_pii = LocalDetectSensitiveInfo(
    deny=["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
)


# guard_tool takes a fixed list of rules, so a check that needs the
# argument value goes in the tool body, before the work happens.
@tool
async def save_note(order_id: str, note: str) -> dict:
    """Save a free-text note on an order."""
    decision = await arcjet.guard(
        label="note.saved",
        rules=[detect_pii(note)],
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Note contains sensitive information")

    return {"order_id": order_id, "note": note}
