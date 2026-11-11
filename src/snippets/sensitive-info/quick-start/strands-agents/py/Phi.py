import os

from strands import tool
from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.strands_agents import guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


@tool
def save_note(order_id: str, note: str) -> dict:
    """Save a free-text note on an order."""
    return {"order_id": order_id, "note": note}


guarded_save_note = guard_tool(
    guard=arcjet,
    tool=save_note,
    action="note.saved",
    # Arcjet's server-side detector reads the note for PHI.
    inputs=lambda arguments: {"note": server_input.string(arguments["note"])},
)
