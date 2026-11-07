import os

from arcjet.guard import ModerateContent, launch_arcjet_sync

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
moderate = ModerateContent()


def screen_prompt(user_text: str) -> None:
    decision = arcjet.guard(
        label="message.received",
        rules=[moderate(user_text)],
    )
    # Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
    # complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
    # decision.warnings for longer text. To moderate all of it, split it up.
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError(
            "Harmful content detected – rephrase your message"
        )
