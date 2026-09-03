import os

from agents import Agent, Runner, function_tool
from arcjet.guard import launch_arcjet, local_input, server_input
from arcjet.guard.openai_agents import guard_tool
from arcjet_sensitive_info_rampart import rampart

# Create one Arcjet client and enable local bank-detail detection.
arcjet = launch_arcjet(
    key=os.environ["ARCJET_KEY"],
    sensitive_info_backend=rampart(),
)


@function_tool
def get_client_record() -> dict:
    """Get the account details on file for the current customer."""
    return current_user.record


@function_tool
def send_email(recipient: str, body: str) -> str:
    """Send an email."""
    email_provider.send(to=recipient, body=body)
    return "sent"


# guard_tool attaches tool_input_guardrails plus reject_content.
guarded_send_email = guard_tool(
    guard=arcjet,
    tool=send_email,
    action="email.sent",
    actor=lambda arguments: current_user.id,
    inputs=lambda arguments: {
        "recipient": server_input.string(arguments["recipient"]),
        "allowed_recipients": server_input.string_list(
            current_user.allowed_recipients
        ),
        "body": local_input.string(arguments["body"]),
    },
)

agent = Agent(
    name="support-agent",
    instructions=(
        "Use get_client_record when the user asks for account "
        "details. Use send_email exactly once to complete the "
        "request."
    ),
    tools=[get_client_record, guarded_send_email],
)


async def run_email_agent(user, prompt: str):
    global current_user
    current_user = user
    return await Runner.run(agent, prompt)
