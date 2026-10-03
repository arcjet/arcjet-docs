import os

from arcjet.guard import TokenBucket, launch_arcjet
from langchain_core.tools import ToolException, tool

arcjet = launch_arcjet(key=os.environ["ARCJET_KEY"])
token_budget = TokenBucket(
    refill_rate=2000,
    interval_seconds=3600,
    max_tokens=5000,
    bucket="ai-tokens",
)


# guard_tool takes a fixed list of rules, so a check that needs the
# argument value goes in the tool body, before the work happens. A
# ToolException with handle_tool_error set reaches the model as an error
# result instead of ending the run.
@tool
async def complete_prompt(prompt: str, estimated_tokens: int) -> dict:
    """Complete a user prompt."""
    decision = await arcjet.guard(
        label="prompt.completed",
        rules=[
            token_budget(
                key="user123",  # Replace with your authenticated user ID
                requested=max(1, int(estimated_tokens)),
            )
        ],
    )
    if decision.conclusion == "DENY":
        raise ToolException("Token budget exceeded")
    if decision.has_failed_open():
        raise ToolException("Token budget could not be checked")

    return {"prompt": prompt}


complete_prompt.handle_tool_error = True
