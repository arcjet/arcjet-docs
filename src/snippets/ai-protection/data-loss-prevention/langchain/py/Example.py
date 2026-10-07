import os

from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.langchain import guard_tool
from langchain_core.tools import tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
detect_pii = LocalDetectSensitiveInfo(
    deny=["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
)


@tool
async def save_note(order_id: str, note: str) -> dict:
    """Save a free-text note on an order."""
    return {"order_id": order_id, "note": note}


# A denial reaches the model as an error result instead of ending the run.
save_note.handle_tool_error = True

save_note = guard_tool(
    guard=arcjet,
    tool=save_note,
    action="note.saved",
    # Called with the tool call's arguments, before the tool runs.
    rules=lambda arguments, _config: [detect_pii(arguments["note"])],
)
