import os

from arcjet.guard import DetectPromptInjection, launch_arcjet_sync

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()


def screen_prompt(user_text: str) -> None:
    decision = arcjet.guard_sync(
        label="message.received",
        rules=[inbound(user_text)],
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError(
            "Prompt injection detected – rephrase your message"
        )
