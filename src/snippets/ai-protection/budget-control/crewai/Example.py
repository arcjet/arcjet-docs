import math
import os

from arcjet.guard import TokenBucket, launch_arcjet_sync
from arcjet.guard.crewai import register_arcjet_hooks
from crewai.tools import tool

# CrewAI hooks are synchronous, so use launch_arcjet_sync.
arcjet = launch_arcjet_sync(key=os.environ["ARCJET_KEY"])
token_budget = TokenBucket(
    refill_rate=2000,
    interval_seconds=3600,
    max_tokens=5000,
    bucket="ai-tokens",
)


@tool("complete_prompt")
def complete_prompt(prompt: str, estimated_tokens: int) -> dict:
    """Complete a user prompt."""
    return {"prompt": prompt}


handle = register_arcjet_hooks(
    guard=arcjet,
    tools=["complete_prompt"],
    action="prompt.completed",
    rules=lambda arguments, _ctx: [
        token_budget(
            # Replace with your authenticated user ID.
            key="user123",
            requested=max(1, math.ceil(arguments["estimated_tokens"])),
        )
    ],
)
