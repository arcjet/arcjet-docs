import os

from arcjet.guard import launch_arcjet_sync, server_input
from flask import abort

# Flask views are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])


# Call this before you store the note or pass it to a model.
def screen_note(user_id: str, note: str) -> None:
    decision = arcjet.guard(
        label="note.saved",
        actor=user_id,
        # Arcjet's server-side detector reads the note for PHI.
        inputs={"note": server_input.string(note)},
    )
    if decision.conclusion == "DENY":
        # The note carries PHI. Ask the user to remove it.
        abort(400, description="Remove health identifiers from the note")
    if decision.has_failed_open():
        # Arcjet couldn't complete the check, so the call failed open. Reject
        # the note to fail closed, or log the error and continue to fail open.
        abort(503, description="Couldn't check the note for PHI. Try again.")
