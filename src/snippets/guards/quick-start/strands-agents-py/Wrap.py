import os

from strands import Agent, tool
from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.strands_agents import guard_hooks, guard_tool
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


def email_tools(user):
    @tool
    def get_client_record() -> dict:
        """Get the account details on file for the current customer."""
        return user.record

    @tool
    def send_email(recipient: str, body: str) -> str:
        """Send an email."""
        email_provider.send(to=recipient, body=body)
        return "sent"

    # This adapter submits action and rules. The recipient
    # allow list is not enforced in this sample.
    guarded_send_email = guard_tool(
        guard=arcjet,
        tool=send_email,
        action="email.sent",
        rules=lambda arguments: [detect_pii(arguments["body"])],
    )

    return get_client_record, guarded_send_email


def run_email_agent(user, prompt: str):
    get_client_record, send_email = email_tools(user)
    agent = Agent(
        tools=[get_client_record, send_email],
        hooks=[
            guard_hooks(guard=arcjet, session_id=user.session_id)
        ],
    )
    return agent(prompt)
