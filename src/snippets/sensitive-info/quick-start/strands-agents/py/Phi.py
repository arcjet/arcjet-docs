import os

from strands import tool
from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.strands_agents import guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


# Before the agent runs: reject a note that carries PHI, so the model never
# receives it.
async def screen_note(user_id: str, note: str) -> None:
    decision = await arcjet.guard(
        label="note.saved",
        actor=user_id,
        inputs={"note": server_input.string(note)},
    )
    # A direct call fails open, so reject failed-open decisions as well.
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise ValueError("Remove health identifiers from the note")


@tool
def save_note(order_id: str, note: str) -> dict:
    """Save a free-text note on an order."""
    return {"order_id": order_id, "note": note}


# When the agent calls the tool: stop the tool if its note carries PHI.
# The model has already read this text.
guarded_save_note = guard_tool(
    guard=arcjet,
    tool=save_note,
    action="note.saved",
    # Arcjet's server-side detector reads the note for PHI.
    inputs=lambda arguments: {"note": server_input.string(arguments["note"])},
)
