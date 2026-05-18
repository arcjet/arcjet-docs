import os
import time

from arcjet.guard import DetectPromptInjection, TokenBucket, launch_arcjet

# Create a single guard client at startup and reuse it
aj = launch_arcjet(key=os.environ["ARCJET_KEY"])

# Configure rules once at module scope so per-rule result accessors work
user_limit = TokenBucket(
    refill_rate=100,
    interval_seconds=60,
    max_tokens=1000,
    bucket="user-tools",  # name this per use case to avoid collisions
)
prompt_scan = DetectPromptInjection()


async def handle_tool_call(user_id: str, message: str) -> str:
    # Bind input and call guard() for each invocation. Hardcode `label`
    # as a string literal so it stays greppable and groups in the dashboard.
    decision = await aj.guard(
        label="tools.weather",
        rules=[
            user_limit(key=user_id, requested=5),
            prompt_scan(message),
        ],
        metadata={"user_id": user_id},
    )

    if decision.conclusion == "DENY":
        # Branch on which rule denied to give the caller something actionable
        rate_limited = user_limit.denied_result(decision)
        if rate_limited:
            retry_in = max(0, rate_limited.reset_at_unix_seconds - int(time.time()))
            raise RuntimeError(f"Rate limited — retry in {retry_in}s")
        raise RuntimeError("Blocked")

    # Safe to proceed with the tool call
    return "..."
