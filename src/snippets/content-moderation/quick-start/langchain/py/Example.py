import os

from arcjet.guard import ModerateContent, launch_arcjet

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
moderate = ModerateContent()


async def screen_message(text: str) -> None:
    decision = await arcjet.guard(
        label="message.received",
        rules=[moderate(text)],
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Harmful content detected – rephrase your message")
