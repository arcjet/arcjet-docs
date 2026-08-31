import os

from arcjet.guard import launch_arcjet_sync, local_input, server_input
from arcjet.guard.crewai import register_arcjet_hooks
from arcjet_sensitive_info_rampart import rampart
from crewai import Agent, Crew, Task
from crewai.tools import tool

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(
    key=os.environ["ARCJET_KEY"],
    sensitive_info_backend=rampart(),
)


@tool("get_client_record")
def get_client_record() -> dict:
    """Get the account details on file for the current customer."""
    return current_user.record


@tool("send_email")
def send_email(recipient: str, body: str) -> str:
    """Send an email."""
    email_provider.send(to=recipient, body=body)
    return "sent"


# register_arcjet_hooks gates every crew tool call on PRE_TOOL_CALL.
register_arcjet_hooks(
    guard=arcjet,
    tools=["send_email"],
    action="email.sent",
    actor=lambda _arguments, _ctx: current_user.id,
    inputs=lambda arguments, _ctx: {
        "recipient": server_input.string(arguments["recipient"]),
        "allowed_recipients": server_input.string_list(
            current_user.allowed_recipients
        ),
        "body": local_input.string(arguments["body"]),
    },
)

agent = Agent(
    role="Support clerk",
    goal="Look up the customer record and send approved email",
    backstory="You send email only to approved recipients.",
    tools=[get_client_record, send_email],
)
task = Task(
    description="{prompt}",
    expected_output="The result of the email request",
    agent=agent,
)
crew = Crew(agents=[agent], tasks=[task])


def run_email_agent(user, prompt: str) -> str:
    global current_user
    current_user = user
    result = crew.kickoff(inputs={"prompt": prompt})
    return str(result)
