import os

from arcjet.guard import DetectPromptInjection, launch_arcjet_sync

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()


def screen_prompt(prompt: str) -> None:
    decision = arcjet.guard_sync(
        label="message.received",
        rules=[inbound(prompt)],
    )

    print("conclusion", decision.conclusion)
    print("reason", decision.reason)
    print("failed open", decision.has_failed_open())

    for result in decision.results:
        print("rule result", result)
