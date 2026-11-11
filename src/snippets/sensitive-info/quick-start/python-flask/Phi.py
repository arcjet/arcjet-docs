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
    # A direct call fails open, so reject failed-open decisions as well.
    if decision.conclusion == "DENY" or decision.has_failed_open():
        abort(400, description="Remove health identifiers from the note")
