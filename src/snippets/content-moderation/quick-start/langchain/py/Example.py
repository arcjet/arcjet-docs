import os

from arcjet.guard import ModerateContent, launch_arcjet

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
moderate = ModerateContent()


async def screen_message(text: str) -> None:
    decision = await arcjet.guard(
        label="message.received",
        rules=[moderate(text)],
    )
    # Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
    # complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
    # decision.warnings for longer text. To moderate all of it, split it up.
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Harmful content detected – rephrase your message")
