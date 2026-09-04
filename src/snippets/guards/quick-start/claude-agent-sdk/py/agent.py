import json
import os

from claude_agent_sdk import (
    ClaudeAgentOptions,
    ResultMessage,
    create_sdk_mcp_server,
    query,
    tool,
)
from arcjet.guard import launch_arcjet, local_input, server_input
from arcjet.guard.claude_agent_sdk import guard_hooks, guard_tool
from arcjet_sensitive_info_rampart import rampart


class EmailProvider:
    def send(self, *, to: str, body: str) -> None:
        return None


# Placeholder for your mail transport.
email_provider = EmailProvider()

# Create one Arcjet client and reuse it across agent runs. Rampart
# evaluates the policy's LOCAL inputs on this machine, so the email body
# never leaves your application.
arcjet = launch_arcjet(
    key=os.environ["ARCJET_KEY"],
    sensitive_info_backend=rampart(),
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

    guarded_send_email = guard_tool(
        guard=arcjet,
        tool=send_email,
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


# Without a role the model asks a clarifying question, or masks the account
# numbers itself, instead of calling send_email with them. Either way the
# guard never gets a decision to make. The last two sentences make the
# sample deterministic; a real prompt can't be relied on for that, which is
# the reason to guard the tool.
SYSTEM_PROMPT = (
    "You are a support desk assistant. Use get_client_record when the "
    "request needs the customer's account details. Use send_email "
    "exactly once to complete the request. Never ask a follow-up "
    "question. Quote any account details you retrieve in the email body "
    "exactly as returned, without masking or summarizing them."
)


async def run_email_agent(user, session_id: str, prompt: str):
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
            # ClaudeAgentOptions.session_id names a new SDK session, so it
            # must be unique per run. It is not the guard session_id.
            session_id=session_id,
            system_prompt=SYSTEM_PROMPT,
            mcp_servers={"email": server},
            allowed_tools=[
                "mcp__email__get_client_record",
                "mcp__email__send_email",
            ],
            # Isolate the sample. setting_sources drops CLAUDE.md and the
            # settings of the machine running this; strict_mcp_config drops
            # its MCP servers too. Without the second one the session can
            # offer the model another way to send mail, straight past the
            # tool you guarded.
            setting_sources=[],
            strict_mcp_config=True,
            hooks=guard_hooks(
                guard=arcjet,
                session_id=user.session_id,
                action=lambda hook: f"{hook['tool_name']}.invoked",
                # send_email is already wrapped with guard_tool. Without
                # this it would be guarded twice for one invocation.
                exclude=[
                    {"server": "email", "name": "send_email"},
                ],
            ),
        ),
    ):
        if isinstance(message, ResultMessage) and message.result is not None:
            result = message.result
    return result
