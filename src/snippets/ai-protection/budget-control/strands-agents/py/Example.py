import math
import os

from strands import tool
from arcjet.guard import TokenBucket, launch_arcjet
from arcjet.guard.strands_agents import guard_tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
token_budget = TokenBucket(
    refill_rate=2000,
    interval_seconds=3600,
    max_tokens=5000,
    bucket="ai-tokens",
)


@tool
def complete_prompt(prompt: str, estimated_tokens: int) -> dict:
    """Complete a user prompt."""
    return {"prompt": prompt}


guarded_complete_prompt = guard_tool(
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
