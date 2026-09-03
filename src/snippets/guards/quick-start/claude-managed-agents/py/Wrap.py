import os

from anthropic import Anthropic
from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.claude_managed_agents import (
    guard_custom_tool,
    guard_events,
)
from arcjet_sensitive_info_rampart import rampart

# Create one Arcjet client and reuse it across agent runs. Rampart
# detects bank account and routing numbers locally.
arcjet = launch_arcjet(
    key=os.environ["ARCJET_KEY"],
    sensitive_info_backend=rampart(),
)
detect_pii = LocalDetectSensitiveInfo(
    deny=["BANK_ACCOUNT", "ROUTING_NUMBER"],
)
client = Anthropic()


class EmailProvider:
    def send(self, *, to: str, body: str) -> None:
        return None


# Placeholder for your mail transport.
email_provider = EmailProvider()


def email_tools(user):
    async def get_client_record(_arguments: dict) -> dict:
        return user.record

    async def send_email(arguments: dict) -> dict:
        email_provider.send(to=arguments["recipient"], body=arguments["body"])
        return {"status": "sent"}

    # This adapter submits action and rules. The recipient
    # allow list is not enforced in this sample.
    guarded_send_email = guard_custom_tool(
        guard=arcjet,
        tool=send_email,
        action="email.sent",
        session_id=user.session_id,
        rules=lambda arguments: [detect_pii(arguments["body"])],
    )

    return get_client_record, guarded_send_email


async def run_email_agent(user, prompt: str):
    get_client_record, send_email = email_tools(user)
    tools = {
        "get_client_record": get_client_record,
        "send_email": send_email,
    }

    await guard_events(
        guard=arcjet,
        session_id=user.session_id,
        prompt=prompt,
    )

    with client.beta.sessions.events.stream(user.session_id) as stream:
        client.beta.sessions.events.send(
            user.session_id,
            events=[
                {
                    "type": "user.message",
                    "content": [{"type": "text", "text": prompt}],
                }
            ],
        )
        for event in stream:
            if event.type == "agent.custom_tool_use":
                handler = tools[event.name]
                result = await handler(event.input)
                client.beta.sessions.events.send(
                    user.session_id,
                    events=[
                        {
                            "type": "user.custom_tool_result",
                            "custom_tool_use_id": event.id,
                            "content": [
                                {
                                    "type": "text",
                                    "text": str(result),
                                }
                            ],
                        }
                    ],
                )
            if event.type == "session.status_idle":
                return "Agent run completed."
