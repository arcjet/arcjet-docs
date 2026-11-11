import os

from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.langchain import guard_tool
from langchain_core.tools import tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


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
    # Arcjet's server-side detector reads the note for PHI.
    inputs=lambda arguments, _config: {"note": server_input.string(arguments["note"])},
)
