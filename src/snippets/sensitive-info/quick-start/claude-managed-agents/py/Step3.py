import os

from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.claude_managed_agents import guard_custom_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
detect_pii = LocalDetectSensitiveInfo(
    deny=["EMAIL", "PHONE_NUMBER", "IP_ADDRESS", "CREDIT_CARD_NUMBER"],
)


async def save_note(event) -> dict:
    return {
        "order_id": event.input["order_id"],
        "note": event.input["note"],
    }


# Anthropic runs built-in tools in its own environment, so a custom tool
# your app executes is the boundary you still hold.
guarded_save_note = guard_custom_tool(
    guard=arcjet,
    run=save_note,
    action="note.saved",
    rules=lambda arguments: [detect_pii(arguments["note"])],
)
