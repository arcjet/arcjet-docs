import os

from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.claude_managed_agents import guard_custom_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
detect_pii = LocalDetectSensitiveInfo()


async def save_note(arguments: dict) -> dict:
    return {
        "order_id": arguments["order_id"],
        "note": arguments["note"],
    }


# Anthropic runs built-in tools in its own environment, so a custom tool
# your app executes is the boundary you still hold.
guarded_save_note = guard_custom_tool(
    guard=arcjet,
    tool=save_note,
    action="note.saved",
    rules=lambda arguments: [detect_pii(arguments["note"])],
)
