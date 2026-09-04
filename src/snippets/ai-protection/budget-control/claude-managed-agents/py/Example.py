import math
import os

from arcjet.guard import TokenBucket, launch_arcjet
from arcjet.guard.claude_managed_agents import guard_custom_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
token_budget = TokenBucket(
    refill_rate=2000,
    interval_seconds=3600,
    max_tokens=5000,
    bucket="ai-tokens",
)


async def complete_prompt(event) -> dict:
    return {"prompt": event.input["prompt"]}


# Pass run= for the hosted path. Call the result with the
# agent.custom_tool_use event, the send callable, and the Anthropic session
# id, so a denial can be posted as the tool result.
guarded_complete_prompt = guard_custom_tool(
    guard=arcjet,
    run=complete_prompt,
    action="prompt.completed",
    rules=lambda arguments: [
        token_budget(
            # Replace with your authenticated user ID.
            key="user123",
            requested=max(1, math.ceil(arguments["estimated_tokens"])),
        )
    ],
)
