import os

from arcjet.guard import launch_arcjet_sync, server_input
from arcjet.guard.crewai import register_arcjet_hooks
from crewai.tools import tool

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])


@tool("save_note")
def save_note(order_id: str, note: str) -> dict:
    """Save a free-text note on an order."""
    return {"order_id": order_id, "note": note}


handle = register_arcjet_hooks(
    guard=arcjet,
    tools=["save_note"],
    action="note.saved",
    # Arcjet's server-side detector reads the note for PHI.
    inputs=lambda arguments, _ctx: {"note": server_input.string(arguments["note"])},
)
