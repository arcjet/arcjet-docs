import os

from arcjet.guard import TokenBucket, launch_arcjet
from arcjet.guard.langchain import guard_tool
from langchain_core.tools import tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
token_budget = TokenBucket(
    refill_rate=2000,
    interval_seconds=3600,
    max_tokens=5000,
    bucket="ai-tokens",
)


@tool
async def complete_prompt(prompt: str, estimated_tokens: int) -> dict:
    """Complete a user prompt."""
    return {"prompt": prompt}


complete_prompt = guard_tool(
    guard=arcjet,
    tool=complete_prompt,
    action="prompt.completed",
    rules=lambda arguments, _config: [
        token_budget(
            key="user123",  # Replace with your authenticated user ID
            requested=max(1, int(arguments["estimated_tokens"])),
        )
    ],
)
