import os

from arcjet.guard import launch_arcjet, local_input, server_input
from arcjet.guard.langchain import guard_tool
from arcjet_sensitive_info_rampart import rampart
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

# Create one Arcjet client and enable local bank-detail detection.
arcjet = launch_arcjet(
    key=os.environ["ARCJET_KEY"],
    sensitive_info_backend=rampart(),
)


@tool
async def send_email(recipient: str, body: str) -> str:
    """Send an email."""
    await email_provider.send(to=recipient, body=body)
    return "sent"


async def run_email_agent(user, prompt: str):
    # This read-only tool returns the current customer's account
    # data.
    @tool
    async def get_client_record() -> dict:
        """Get the account details on file for the current customer."""
        return user.record

    # guard_tool checks remote policy before send_email can run.
    guarded_send_email = guard_tool(
        guard=arcjet,
        tool=send_email,
        # The action selects the remote policy configured in step 1.
        action="email.sent",
        # Actor and the allow list come from trusted application
        # state.
        actor=user.id,
        # Map only the values the remote policy needs.
        inputs=lambda arguments, _config: {
            "recipient": server_input.string(arguments["recipient"]),
            "allowed_recipients": server_input.string_list(
                user.allowed_recipients
            ),
            "body": local_input.string(arguments["body"]),
        },
    )

    # The model can call either tool, but send_email always passes
    # through Arcjet.
    agent = create_agent(
        ChatOpenAI(model="gpt-4o-mini"),
        tools=[get_client_record, guarded_send_email],
        system_prompt=(
            "Use get_client_record when the user asks for account "
            "details. Use send_email exactly once to complete the "
            "request."
        ),
    )
    return await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]}
    )
