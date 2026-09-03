import os

from arcjet.guard import ModerateContent, launch_arcjet
from arcjet.guard.strands_agents import strands_agent_context

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
moderate = ModerateContent()


async def screen_prompt(conversation_id: str, user_text: str) -> None:
    app_context = {"session_id": conversation_id}
    derived = strands_agent_context(app_context)

    decision = await arcjet.guard(
        label="message.received",
        rules=[moderate(user_text)],
        correlation_id=derived.correlation_id,
    )
    if (
        decision.conclusion == "DENY"
        and decision.reason == "MODERATE_CONTENT"
    ):
        raise RuntimeError(
            "Harmful content detected – rephrase your message"
        )
