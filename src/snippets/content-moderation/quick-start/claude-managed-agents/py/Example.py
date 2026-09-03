import os

from anthropic import Anthropic
from arcjet.guard import ModerateContent, launch_arcjet
from arcjet.guard.claude_managed_agents import guard_events

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
client = Anthropic()
moderate = ModerateContent()


# Pass the Anthropic session `id` from `client.beta.sessions.create`.
async def send_turn(session_id: str, user_text: str) -> None:
    await guard_events(
        guard=arcjet,
        session_id=session_id,
        inbound={
            "action": "message.received",
            "rules": lambda arguments: [moderate(arguments["prompt"])],
        },
        prompt=user_text,
    )
    client.beta.sessions.events.send(
        session_id,
        events=[
            {
                "type": "user.message",
                "content": [{"type": "text", "text": user_text}],
            }
        ],
    )
