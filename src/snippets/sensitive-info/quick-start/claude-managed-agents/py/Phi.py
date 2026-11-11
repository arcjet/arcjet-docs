import os

from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.claude_managed_agents import guard_custom_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


async def save_note(event) -> dict:
    return {
        "order_id": event.input["order_id"],
        "note": event.input["note"],
    }


guarded_save_note = guard_custom_tool(
    guard=arcjet,
    run=save_note,
    action="note.saved",
    # Arcjet's server-side detector reads the note for PHI.
    inputs=lambda arguments: {"note": server_input.string(arguments["note"])},
)
