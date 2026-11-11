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
    # Deny detected PHI and checks that Arcjet couldn't complete.
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise HTTPException(
            status_code=400, detail="Remove health identifiers from the note"
        )
