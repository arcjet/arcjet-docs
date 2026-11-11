import os

from arcjet.guard import launch_arcjet, server_input
from arcjet.guard.claude_managed_agents import guard_custom_tool

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


async def save_note(event) -> dict:
    return {
        "order_id": event.input["order_id"],
        "note": event.input["note"],
    }


# When the agent calls the tool: stop the tool if its note carries PHI.
# The model has already read this text.
guarded_save_note = guard_custom_tool(
    guard=arcjet,
    run=save_note,
    action="note.saved",
    # Arcjet's server-side detector reads the note for PHI.
    inputs=lambda arguments: {"note": server_input.string(arguments["note"])},
)
