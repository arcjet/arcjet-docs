import os

from arcjet.guard import DetectPromptInjection, launch_arcjet
from arcjet.guard.strands_agents import strands_agent_context

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
inbound = DetectPromptInjection()


async def screen_prompt(conversation_id: str, user_text: str) -> None:
    app_context = {"session_id": conversation_id}
    derived = strands_agent_context(app_context)

    decision = await arcjet.guard(
        label="message.received",
        rules=[inbound(user_text)],
        correlation_id=derived.correlation_id,
    )
    if decision.conclusion == "DENY" or decision.has_failed_open():
        raise RuntimeError(
            "Prompt injection detected – rephrase your message"
        )
