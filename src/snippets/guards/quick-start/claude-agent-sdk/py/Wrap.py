import json
import os

from claude_agent_sdk import (
    ClaudeAgentOptions,
    ResultMessage,
    create_sdk_mcp_server,
    query,
    tool,
)
from arcjet.guard import LocalDetectSensitiveInfo, launch_arcjet
from arcjet.guard.claude_agent_sdk import guard_hooks, guard_tool
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
    @tool(
        "get_client_record",
        "Get the account details on file for the current customer",
        {},
    )
    async def get_client_record(_args: dict) -> dict:
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(user.record),
                }
            ]
        }

    @tool("send_email", "Send an email", {"recipient": str, "body": str})
    async def send_email(args: dict) -> dict:
        email_provider.send(to=args["recipient"], body=args["body"])
        return {
            "content": [{"type": "text", "text": "sent"}],
        }

    # This adapter submits action and rules. The recipient
    # allow list is not enforced in this sample.
    guarded_send_email = guard_tool(
        guard=arcjet,
        tool=send_email,
        action="email.sent",
        session_id=user.session_id,
        rules=lambda arguments: [detect_pii(arguments["body"])],
    )

    return get_client_record, guarded_send_email


async def run_email_agent(user, prompt: str):
    get_client_record, send_email = email_tools(user)
    server = create_sdk_mcp_server(
        name="email",
        version="1.0.0",
        tools=[get_client_record, send_email],
    )

    result = None
    async for message in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            session_id=user.session_id,
            mcp_servers={"email": server},
            allowed_tools=[
                "mcp__email__get_client_record",
                "mcp__email__send_email",
            ],
            hooks=guard_hooks(
                guard=arcjet,
                session_id=user.session_id,
                action=lambda hook: f"{hook['tool_name']}.invoked",
                exclude=[
                    {"server": "email", "name": "send_email"},
                ],
            ),
        ),
    ):
        if isinstance(message, ResultMessage) and message.result is not None:
            result = message.result
    return result
