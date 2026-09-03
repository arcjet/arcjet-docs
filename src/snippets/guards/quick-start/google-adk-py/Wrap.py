import os

from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.tools import FunctionTool
from google.genai import types
from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.google_adk import guard_plugin
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


class EmailProvider:
    def send(self, *, to: str, body: str) -> None:
        return None


# Placeholder for your mail transport.
email_provider = EmailProvider()


def get_client_record() -> dict:
    """Get the account details on file for the current customer."""
    return current_user.record


def send_email(recipient: str, body: str) -> str:
    """Send an email."""
    email_provider.send(to=recipient, body=body)
    return "sent"


agent = LlmAgent(
    name="support_agent",
    model="gemini-flash-latest",
    instruction=(
        "Use get_client_record when the user asks for account "
        "details. Use send_email exactly once to complete the "
        "request."
    ),
    tools=[FunctionTool(get_client_record), FunctionTool(send_email)],
)


async def run_email_agent(user, prompt: str):
    global current_user
    current_user = user

    # guard_plugin is the Runner-wide gate. guard_tool is the
    # LlmAgent.before_tool_callback. Pick one for a given run.
    runner = InMemoryRunner(
        agent=agent,
        app_name="support",
        plugins=[
            guard_plugin(
                guard=arcjet,
                session_id=user.id,
                action=lambda call: (
                    "email.sent"
                    if call["tool_name"] == "send_email"
                    else "tool.invoked"
                ),
                rules=lambda call: (
                    [detect_pii(call["input"]["body"])]
                    if call["tool_name"] == "send_email"
                    else []
                ),
            )
        ],
    )
    return runner.run_async(
        user_id=user.id,
        session_id=user.id,
        new_message=types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    )
