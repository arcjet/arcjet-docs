import os

from arcjet.guard import DetectPromptInjection, launch_arcjet

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()


async def screen_prompt(prompt: str) -> None:
    decision = await arcjet.guard(
        label="message.received",
        rules=[inbound(prompt)],
    )
    print("conclusion", decision.conclusion)
    print("reason", decision.reason)
    print("failed open", decision.has_failed_open())
    for result in decision.results:
        print("rule result", result)
