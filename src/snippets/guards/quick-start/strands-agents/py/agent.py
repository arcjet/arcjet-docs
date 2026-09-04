import os

from strands import Agent, tool
from arcjet.guard import launch_arcjet, local_input, server_input
from arcjet.guard.strands_agents import guard_hooks, guard_tool
from arcjet_sensitive_info_rampart import rampart

# Create one Arcjet client and reuse it across agent runs. Rampart
# evaluates the policy's LOCAL inputs on this machine, so the email body
# never leaves your application.
arcjet = launch_arcjet(
    key=os.environ["ARCJET_KEY"],
    sensitive_info_backend=rampart(),
)


class EmailProvider:
    def send(self, *, to: str, body: str) -> None:
        return None


# Placeholder for your mail transport.
email_provider = EmailProvider()


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
    "request needs account details. Use send_email exactly once to "
    "complete the request. Never ask a follow-up question. Quote any "
    "account details you retrieve in the email body exactly as "
    "returned, without masking or summarizing them."
)


async def run_email_agent(user, prompt: str):
    get_client_record, send_email = email_tools(user)
    # guard_hooks gates the tools that guard_tool did not wrap. It skips
    # send_email, which carries the wrapper's brand.
    agent = Agent(
        system_prompt=SYSTEM_PROMPT,
        tools=[get_client_record, send_email],
        hooks=[guard_hooks(guard=arcjet, session_id=user.session_id)],
    )
    return agent(prompt)
