import os

from anthropic import AsyncAnthropic
from arcjet.guard import (
    ArcjetDeniedError,
    DetectPromptInjection,
    launch_arcjet,
)
from arcjet.guard.claude_managed_agents import guard_events

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])

# guard_events runs an inbound check before each user.message reaches the
# session, so use the async client: the sync one can't be awaited here.
client = AsyncAnthropic()
inbound = DetectPromptInjection()

# guard_events wraps send. On DENY it raises and never calls the real send,
# so an injected prompt never reaches the session.
send = guard_events(
    guard=arcjet,
    send=client.beta.sessions.events.send,
    action="message.received",
    rules=lambda arguments: [inbound(arguments["prompt"])],
)


# session_id is the Anthropic session id from client.beta.sessions.create.
async def send_turn(session_id: str, user_text: str) -> bool:
    try:
        await send(
            session_id,
            events=[
                {
                    "type": "user.message",
                    "content": [{"type": "text", "text": user_text}],
                }
            ],
        )
    except ArcjetDeniedError:
        return False
    return True
