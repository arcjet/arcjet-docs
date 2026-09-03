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


async def complete_prompt(arguments: dict) -> dict:
    return {"prompt": arguments["prompt"]}


guarded_complete_prompt = guard_custom_tool(
    guard=arcjet,
    tool=complete_prompt,
    action="prompt.completed",
    rules=lambda arguments: [
        token_budget(
            # Replace with your authenticated user ID.
            key="user123",
            requested=max(1, math.ceil(arguments["estimated_tokens"])),
        )
    ],
)
