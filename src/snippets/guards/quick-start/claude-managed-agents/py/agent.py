import json
import os

from anthropic import AsyncAnthropic
from arcjet.guard import launch_arcjet, local_input, server_input
from arcjet.guard.claude_managed_agents import (
    guard_custom_tool,
    guard_events,
)
from arcjet_sensitive_info_rampart import rampart

# Create one Arcjet client and reuse it across agent runs. Rampart
# evaluates the policy's LOCAL inputs on this machine, so the email body
# never leaves your application.
arcjet = launch_arcjet(
    key=os.environ["ARCJET_KEY"],
    sensitive_info_backend=rampart(),
)

# guard_events runs an inbound check before each user.message reaches the
# session, so use the async client: the sync one can't be awaited here.
client = AsyncAnthropic()


class EmailProvider:
    async def send(self, *, to: str, body: str) -> None:
        return None


# Placeholder for your mail transport.
email_provider = EmailProvider()


def email_tools(user):
    async def get_client_record(_event) -> dict:
        return user.record

    async def send_email(event) -> dict:
        arguments = event.input
        await email_provider.send(
            to=arguments["recipient"], body=arguments["body"]
        )
        return {"status": "sent"}

    # Pass run= for the hosted path. On DENY the handler sends the
    # denial as the tool result and send_email never runs.
    guarded_send_email = guard_custom_tool(
        guard=arcjet,
        run=send_email,
        # The action selects the remote policy you configured in step 1.
        action="email.sent",
        # Actor and the allow list come from trusted application state.
        actor=user.id,
        session_id=user.session_id,
        # Map only the values the remote policy needs.
        inputs=lambda arguments: {
            "recipient": server_input.string(arguments["recipient"]),
            "allowed_recipients": server_input.string_list(
                user.allowed_recipients
            ),
            "body": local_input.string(arguments["body"]),
        },
    )

    return get_client_record, guarded_send_email


async def run_email_agent(user, session_id: str, prompt: str):
    get_client_record, send_email = email_tools(user)

    # Screen the inbound prompt, then send it with the wrapped send.
    send = guard_events(
        guard=arcjet,
        send=client.beta.sessions.events.send,
        action="message.received",
        actor=user.id,
        session_id=user.session_id,
    )

    stream = await client.beta.sessions.events.stream(session_id)
    await send(
        session_id,
        events=[
            {
                "type": "user.message",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
    )

    async for event in stream:
        if event.type == "agent.custom_tool_use":
            if event.name == "send_email":
                # The wrapper sends the denial itself and returns None.
                result = await send_email(
                    event,
                    send=client.beta.sessions.events.send,
                    session_id=session_id,
                )
                if result is None:
                    continue
            else:
                result = await get_client_record(event)
            await send(
                session_id,
                events=[
                    {
                        "type": "user.custom_tool_result",
                        "custom_tool_use_id": event.id,
                        "content": [
                            {"type": "text", "text": json.dumps(result)}
                        ],
                    }
                ],
            )
        if event.type == "session.status_idle":
            return "Agent run completed."
