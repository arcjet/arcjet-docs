import os

from arcjet.guard import DetectPromptInjection, launch_arcjet

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()


async def screen_prompt(user_id: str, prompt: str) -> None:
    decision = await arcjet.guard(
        label="message.received",
        actor=user_id,
        rules=[inbound(prompt)],
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError("Prompt injection detected – rephrase your message")
