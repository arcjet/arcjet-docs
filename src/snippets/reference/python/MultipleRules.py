import os

from arcjet import Mode, arcjet, detect_bot, token_bucket

aj = arcjet(
    key=os.environ["ARCJET_KEY"],
    rules=[
        # Create a token bucket rate limit. Other algorithms are supported
        token_bucket(
            mode=Mode.LIVE,  # Use Mode.DRY_RUN to log only
            refill_rate=5,  # Refill 5 tokens per interval
            interval=10,  # Refill every 10 seconds
            capacity=10,  # Bucket capacity of 10 tokens
        ),
        # Detect automated clients
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # An empty allow list blocks all bots
        ),
    ],
)
