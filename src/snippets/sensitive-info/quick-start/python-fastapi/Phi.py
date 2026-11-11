import os

from arcjet.guard import launch_arcjet, server_input
from fastapi import HTTPException

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])


# Call this before you store the note or pass it to a model.
async def screen_note(user_id: str, note: str) -> None:
    decision = await arcjet.guard(
        label="note.saved",
        actor=user_id,
        # Arcjet's server-side detector reads the note for PHI.
        inputs={"note": server_input.string(note)},
    )
    if decision.conclusion == "DENY":
        # The note carries PHI. Ask the user to remove it.
        raise HTTPException(400, "Remove health identifiers from the note")
    if decision.has_failed_open():
        # Arcjet couldn't complete the check, so the call failed open. Reject
        # the note to fail closed, or log the error and continue to fail open.
        raise HTTPException(503, "Couldn't check the note for PHI. Try again.")
